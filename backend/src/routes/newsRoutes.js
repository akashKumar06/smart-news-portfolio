import { Router } from "express";
import {
  fetchGeneralNews,
  filterNewsByPortfolio,
} from "../services/newsService.js";
import {
  analyzeGeneralMarketSentiment,
  analyzeSentiment,
} from "../services/aiService.js";
const router = Router();

/**
 * @route GET /api/news/general
 * @description Fetches and returns all general stock market news.
 * @access Public
 */

router.get("/general", async (req, res) => {
  try {
    const news = await fetchGeneralNews();
    return res.status(200).json(news);
  } catch (error) {
    console.log("Error fetching general news", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch general news", error: error.message });
  }
});

/**
 * @route POST /api/news/filtered
 * @description Filters news based on provided portfolio symbols and analyzes sentiment for each.
 * @access Public (or protected by auth later)
 * @body {string[]} portfolioSymbols - An array of stock symbols (e.g., ["RELIANCE.NS", "TCS.NS"])
 */

router.post("/filtered", async (req, res) => {
  const { portfolioSymbols } = req.body;

  if (
    !portfolioSymbols ||
    !Array.isArray(portfolioSymbols) ||
    portfolioSymbols.length === 0
  ) {
    return res.status(400).json({ message: "Portfolio symbols are required." });
  }

  try {
    // 1. Fetch a broad set of general news articles (e.g., about the stock market)
    const generalNewsArticles = await fetchGeneralNews();

    // 2. Filter these general news articles by the provided portfolio symbols
    const filteredNews = filterNewsByPortfolio(
      generalNewsArticles,
      portfolioSymbols
    );

    // 3. Perform sentiment analysis on each filtered news article
    const filteredNewsWithSentiment = await Promise.all(
      filteredNews.map(async (article) => {
        const textForAnalysis = article.description || article.title;
        if (!textForAnalysis) {
          return {
            ...article,
            sentiment: "Neutral",
            reasoning: "No content for analysis.",
            compound: 0,
          };
        }

        try {
          const sentimentAnalysis = await analyzeSentiment(textForAnalysis);
          return {
            ...article,
            sentiment: sentimentAnalysis.sentiment,
            reasoning: sentimentAnalysis.reasoning,
            compound: sentimentAnalysis.compound,
          };
        } catch (sentimentError) {
          console.error(
            `Error analyzing sentiment for article "${article.title}":`,
            sentimentError
          );
          return {
            ...article,
            sentiment: "Neutral",
            reasoning: "Sentiment analysis failed.",
            compound: 0,
          };
        }
      })
    );

    // 5. Send the filtered news with sentiment back to the frontend
    res.json(filteredNewsWithSentiment);
  } catch (error) {
    console.error("Error in /api/news/filtered:", error);
    res
      .status(500)
      .json({ message: "Error fetching filtered news.", error: error.message });
  }
});

/**
 * @route GET /api/news/general-sentiment
 * @description Get overall market sentiment based on recent general news.
 * @access Public
 */
router.get("/general-sentiment", async (req, res) => {
  try {
    const generalNews = await fetchGeneralNews();
    const topHeadlines = generalNews.slice(0, 10);

    const marketSentiment = await analyzeGeneralMarketSentiment(topHeadlines);
    res.json(marketSentiment);
  } catch (error) {
    console.error(
      "Error fetching or analyzing general market sentiment:",
      error
    );
    res.status(500).json({
      message: "Failed to fetch general market sentiment",
      error: error.message,
    });
  }
});

export default router;
