import axios from "axios";
import { analyzeSentiment } from "./aiService.js";

const NEWS_API_BASE_URL = "https://newsapi.org/v2";
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const SENTIMENT_API_URL = process.env.SENTIMENT_API_URL;

if (!NEWS_API_KEY) {
  console.warn(
    "NEWS_API_KEY is not set. News fetching for emails might not work correctly."
  );
}
if (!SENTIMENT_API_URL) {
  console.warn(
    "SENTIMENT_API_URL is not set. Sentiment analysis for emails might not work correctly."
  );
}

const fetchAndAnalyzeNews = async (articles) => {
  const articlesWithSentiment = [];
  for (const article of articles) {
    try {
      if (article.title || article.description) {
        const textToAnalyze = article.title || article.description;
        const sentimentResult = await analyzeSentiment(textToAnalyze);
        articlesWithSentiment.push({
          ...article,
          sentiment: sentimentResult.sentiment,
          compound: sentimentResult.compound,
        });
      } else {
        articlesWithSentiment.push({
          ...article,
          sentiment: "Neutral",
          compound: 0,
        });
      }
    } catch (error) {
      console.error(
        `Error analyzing sentiment for article "${article.title}":`,
        error
      );
      articlesWithSentiment.push({
        ...article,
        sentiment: "Error",
        compound: 0,
      });
    }
  }
  return articlesWithSentiment;
};

/**
 * @function fetchGeneralNewsForEmail
 * @description Fetches a few top general news headlines for the daily digest and analyzes their sentiment.
 * @returns {Promise<Array>} A promise that resolves to an array of news articles with sentiment.
 */
export const fetchGeneralNewsForEmail = async () => {
  if (!NEWS_API_KEY) return [];
  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
      params: {
        q: "stock market India", // Specific query for general Indian stock market news
        country: "in", // Target India
        language: "en",
        pageSize: 10, // Get a small number of top articles
      },
      headers: {
        "X-Api-Key": NEWS_API_KEY,
      },
    });
    const articles = response.data.articles || [];
    return await fetchAndAnalyzeNews(articles); // Analyze sentiment for each fetched article
  } catch (error) {
    console.error("Error fetching general news for email:", error);
    return [];
  }
};

/**
 * @function fetchOverallSentimentForEmail
 * @description Fetches a larger set of general market news articles to calculate an overall market sentiment.
 * @returns {Promise<Object>} A promise that resolves to an object with overall sentiment, reasoning, and compound score.
 */

export const fetchOverallSentimentForEmail = async () => {
  if (!NEWS_API_KEY)
    return {
      sentiment: "Neutral",
      reasoning: "News API key missing.",
      compound: 0,
    };

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: "stock market India OR Nifty 50 OR Sensex",
        language: "en",
        sortBy: "relevancy",
        pageSize: 20,
      },
      headers: {
        "X-Api-Key": NEWS_API_KEY,
      },
    });
    const articles = response.data.articles || [];
    if (articles.length === 0)
      return {
        sentiment: "Neutral",
        reasoning: "No articles to analyze.",
        compound: 0,
      };

    let totalCompoundScore = 0;
    let analyzedCount = 0;

    // Analyze sentiment for each article and sum up compound scores
    for (const article of articles) {
      if (article.title || article.description) {
        try {
          const textToAnalyze = article.title || article.description;
          const sentimentResult = await analyzeSentiment(textToAnalyze); // Calls your Python API
          totalCompoundScore += sentimentResult.compound;
          analyzedCount++;
        } catch (sentimentError) {
          console.warn(
            `Could not analyze sentiment for article in overall batch: ${article.title}`,
            sentimentError.message
          );
        }
      }
    }

    if (analyzedCount === 0)
      return {
        sentiment: "Neutral",
        reasoning: "No articles could be analyzed for overall sentiment.",
        compound: 0,
      };

    const averageCompoundScore = totalCompoundScore / analyzedCount;
    let overallSentiment = "Neutral";
    let overallReasoning = `Based on an average compound score of ${averageCompoundScore.toFixed(
      2
    )} from ${analyzedCount} articles.`;

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
  } catch (error) {
    console.error("Error fetching articles for overall sentiment:", error);
    return {
      sentiment: "Error",
      reasoning: "Failed to fetch news for overall sentiment analysis.",
      compound: 0,
    };
  }
};

/**
 * @function fetchFilteredNewsForEmail
 * @description Fetches news articles relevant to a list of specified stock symbols and analyzes their sentiment.
 * @param {string[]} symbols - An array of stock ticker symbols (e.g., ['RELIANCE.NS', 'TCS.NS']).
 * @returns {Promise<Array>} A promise that resolves to an array of news articles with sentiment, each tagged with its symbol.
 */
export const fetchFilteredNewsForEmail = async (symbols) => {
  if (!NEWS_API_KEY || !symbols || symbols.length === 0) return [];

  let allArticles = [];
  for (const symbol of symbols) {
    try {
      const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
        params: {
          q: symbol, // Query by the individual stock symbol
          language: "en",
          sortBy: "relevancy", // Get the most relevant articles for the symbol
          pageSize: 3, // Get a few recent articles per symbol
        },
        headers: {
          "X-Api-Key": NEWS_API_KEY,
        },
      });
      // Add the symbol to each article so we know which symbol it's related to in the email
      const articlesForSymbol = (response.data.articles || []).map(
        (article) => ({ ...article, symbol })
      );
      allArticles = allArticles.concat(articlesForSymbol);
    } catch (error) {
      console.error(
        `Error fetching news for symbol ${symbol} for email:`,
        error
      );
    }
  }
  return await fetchAndAnalyzeNews(allArticles);
};
