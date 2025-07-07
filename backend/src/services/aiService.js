import axios from "axios";

const SENTIMENT_API_URL = process.env.SENTIMENT_API_URL;

export async function analyzeSentiment(text) {
  if (!SENTIMENT_API_URL) {
    console.error(
      "SENTIMENT_API_URL environment variable is not set. Cannot perform sentiment analysis."
    );
    throw new Error("Sentiment analysis service URL is not configured.");
  }

  try {
    const response = await axios.post(`${SENTIMENT_API_URL}/analyze`, { text });

    const result = response.data;

    if (
      !result ||
      typeof result.sentiment === "undefined" ||
      typeof result.reasoning === "undefined" ||
      !result.scores ||
      typeof result.scores.compound === "undefined"
    ) {
      throw new Error(
        "Invalid response format from sentiment analysis service."
      );
    }

    return {
      sentiment: result.sentiment,
      reasoning: result.reasoning,
      compound: result.scores.compound,
    };
  } catch (error) {
    console.error(`Error calling sentiment analysis API: ${error.message}`);
    if (error.response) {
      console.error("Sentiment API Response Data:", error.response.data);
      console.error("Sentiment API Response Status:", error.response.status);
      console.error("Sentiment API Response Headers:", error.response.headers);
      throw new Error(
        `Sentiment API error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else if (error.request) {
      console.error("No response received from sentiment API:", error.request);
      throw new Error("No response received from sentiment analysis service.");
    } else {
      console.error("Error setting up sentiment API request:", error.message);
      throw new Error(`Error with sentiment API request: ${error.message}`);
    }
  }
}

export async function analyzeGeneralMarketSentiment(articles) {
  if (!articles || articles.length === 0) {
    return {
      sentiment: "Neutral",
      reasoning: "No articles to analyze for general market sentiment.",
      compound: 0.0,
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
      compound: 0.0,
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

  return {
    sentiment: overallSentiment,
    reasoning: overallReasoning,
    compound: averageCompoundScore,
  };
}
