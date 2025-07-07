import { Router } from "express";
import {
  fetchGeneralNews,
  filterNewsByPortfolio,
} from "../services/newsService.js";
import {
  analyzeGeneralMarketSentiment,
  analyzeSentiment,
} from "../services/aiService.js";
import { sendEmail } from "../services/notificationService.js";
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
  const { portfolioSymbols, notificationEmail } = req.body;

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

    // 4. Automated Notification Logic (remains the same)
    if (notificationEmail && notificationEmail.trim() !== "") {
      const alertsToSend = [];
      filteredNewsWithSentiment.forEach((article) => {
        const isStrongPositive = article.compound >= 0.6;
        const isStrongNegative = article.compound <= -0.6;

        if (isStrongPositive || isStrongNegative) {
          alertsToSend.push(article);
        }
      });

      if (alertsToSend.length > 0) {
        const subject = `Smart News Portfolio Alert: ${alertsToSend.length} New Alerts for your Stocks`;
        let htmlContent = `
                    <p>Dear Investor,</p>
                    <p>Here are some recent significant news alerts for your portfolio:</p>
                    <ul>
                `;
        alertsToSend.forEach((article) => {
          htmlContent += `
                        <li>
                            <strong>${article.sentiment} News for ${
            article.symbol || "Your Portfolio"
          }</strong>:
                            <a href="${article.url}" target="_blank">${
            article.title
          }</a>
                            <p>${article.description || ""}</p>
                            ${
                              article.reasoning
                                ? `<p>Reasoning: ${article.reasoning}</p>`
                                : ""
                            }
                            <p><em>Source: ${article.source} - ${new Date(
            article.publishedAt
          ).toLocaleDateString()}</em></p>
                        </li>
                    `;
        });
        htmlContent += `</ul><p>Visit your <a href="http://localhost:5173" target="_blank">Smart News Portfolio</a> for more details.</p>`;

        const textContent =
          `Smart News Portfolio Alert: ${alertsToSend.length} New Alerts\n\n` +
          alertsToSend
            .map(
              (article) =>
                `${article.sentiment} News for ${
                  article.symbol || "Your Portfolio"
                }:\n` +
                `Title: ${article.title}\n` +
                `URL: ${article.url}\n` +
                `Description: ${article.description || ""}\n` +
                `${
                  article.reasoning ? `Reasoning: ${article.reasoning}\n` : ""
                }` +
                `Source: ${article.source} - ${new Date(
                  article.publishedAt
                ).toLocaleDateString()}\n\n`
            )
            .join("");

        try {
          await sendEmail(notificationEmail, subject, textContent, htmlContent);
          console.log(
            `Automated alert email sent to ${notificationEmail} for ${alertsToSend.length} articles.`
          );
        } catch (emailError) {
          console.error(
            "Failed to send automated alert email:",
            emailError.message
          );
        }
      }
    }

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
    // Fetch a limited number of top general news articles to summarize
    // You can adjust the number (e.g., 5 or 10) based on how much text you want to analyze for overall sentiment
    const generalNews = await fetchGeneralNews();
    const topHeadlines = generalNews
      .slice(0, 5)
      .map((article) => article.title)
      .join(". "); // Join top 5 headlines

    if (!topHeadlines.trim()) {
      return res.json({
        sentiment: "Neutral",
        reasoning:
          "No general news headlines available to analyze for market sentiment.",
      });
    }

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
