// smart-news-portfolio/backend/src/services/aiService.js

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_SCRIPT_PATH = path.join(
  __dirname,
  "../../../ai_sentiment_python/analyze_sentiment.py"
);
const PYTHON_EXECUTABLE =
  process.platform === "win32"
    ? path.join(
        __dirname,
        "../../../ai_sentiment_python/venv/Scripts/python.exe"
      )
    : path.join(__dirname, "../../../ai_sentiment_python/venv/bin/python");

export async function analyzeSentiment(text) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(PYTHON_EXECUTABLE, [PYTHON_SCRIPT_PATH, text]);

    let pythonOutput = "";
    let pythonError = "";

    pythonProcess.stdout.on("data", (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(
          `Python script exited with code ${code}. Error: ${pythonError}`
        );
        try {
          const errorResult = JSON.parse(pythonOutput);
          if (errorResult.error) {
            return reject(
              new Error(`Python script error: ${errorResult.error}`)
            );
          }
        } catch (e) {}
        return reject(
          new Error(
            `Python script exited with code ${code}. Stderr: ${pythonError}. Stdout: ${pythonOutput}`
          )
        );
      }

      try {
        const result = JSON.parse(pythonOutput);
        if (result.error) {
          console.error(
            "Python script returned an an application error:",
            result.error
          );
          return reject(
            new Error(`Python script application error: ${result.error}`)
          );
        }

        resolve({
          sentiment: result.sentiment,
          reasoning: result.reasoning,
          compound: result.scores.compound,
        });
      } catch (parseError) {
        console.error("Error parsing Python script output:", parseError);
        console.error("Python Output:", pythonOutput);
        console.error("Python Error (stderr):", pythonError);
        reject(
          new Error(
            `Failed to parse Python script output: ${parseError.message}. Raw output: ${pythonOutput}`
          )
        );
      }
    });

    pythonProcess.on("error", (err) => {
      console.error("Failed to start Python child process:", err);
      reject(
        new Error(
          `Failed to start sentiment analysis process: ${err.message}. Check Python path and script permissions.`
        )
      );
    });
  });
}

export async function analyzeGeneralMarketSentiment(articles) {
  if (!articles || articles.length === 0) {
    return {
      sentiment: "Neutral",
      reasoning: "No articles to analyze for general market sentiment.",
    };
  }

  const sentiments = [];
  let totalCompoundScore = 0;

  for (const article of articles) {
    try {
      const textToAnalyze = article.title || article.description;
      if (textToAnalyze) {
        const analysisResult = await analyzeSentiment(textToAnalyze);
        sentiments.push(analysisResult);
        totalCompoundScore += analysisResult.compound;
      }
    } catch (error) {
      console.error(
        `Error analyzing sentiment for general article: ${article.title}`,
        error
      );
    }
  }

  if (sentiments.length === 0) {
    return {
      sentiment: "Neutral",
      reasoning: "Could not analyze sentiment for any general articles.",
    };
  }

  const averageCompoundScore = totalCompoundScore / sentiments.length;

  let overallSentiment = "Neutral";
  let overallReasoning = `Based on an average compound score of ${averageCompoundScore.toFixed(
    2
  )} from ${sentiments.length} articles.`;

  if (averageCompoundScore >= 0.05) {
    overallSentiment = "Positive";
    overallReasoning += " The overall tone is generally positive.";
  } else if (averageCompoundScore <= -0.05) {
    overallSentiment = "Negative";
    overallReasoning += " The overall tone is generally negative.";
  } else {
    overallReasoning += " The overall tone is neutral or mixed.";
  }

  return { sentiment: overallSentiment, reasoning: overallReasoning };
}
