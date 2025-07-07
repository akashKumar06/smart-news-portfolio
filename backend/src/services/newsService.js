import axios from "axios";

let mockNews = [
  {
    id: "n1",
    title: "Reliance Industries stock soars 5% on strong Q1 results",
    link: "https://example.com/news/reliance-q1",
    source: "Moneycontrol",
    date: "2025-07-07T10:00:00Z",
  },
  {
    id: "n2",
    title: "TCS inks major deal with European client",
    link: "https://example.com/news/tcs-deal",
    source: "Economic Times",
    date: "2025-07-07T09:30:00Z",
  },
  {
    id: "n3",
    title: "Infosys faces headwinds from global tech slowdown",
    link: "https://example.com/news/infosys-slowdown",
    source: "Livemint",
    date: "2025-07-06T18:00:00Z",
  },
  {
    id: "n4",
    title: "Indian market sentiment positive ahead of budget session",
    link: "https://example.com/news/market-budget",
    source: "Business Standard",
    date: "2025-07-07T11:00:00Z",
  },
  {
    id: "n5",
    title: "New government policy boosts renewable energy sector stocks",
    link: "https://example.com/news/renewable-policy",
    source: "Financial Express",
    date: "2025-07-07T08:00:00Z",
  },
  {
    id: "n6",
    title: "HDFC Bank announces new lending rates",
    link: "https://example.com/news/hdfc-rates",
    source: "Moneycontrol",
    date: "2025-07-07T12:00:00Z",
  },
  {
    id: "n7",
    title: "SBI shares jump on strong asset quality report",
    link: "https://example.com/news/sbi-quality",
    source: "The Hindu BusinessLine",
    date: "2025-07-07T13:00:00Z",
  },
  {
    id: "n8",
    title: "Maruti Suzuki sales figures exceed expectations",
    link: "https://example.com/news/maruti-sales",
    source: "NDTV Profit",
    date: "2025-07-07T09:00:00Z",
  },
];

export async function fetchGeneralNews() {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) {
      console.warn(
        "NEWS_API_KEY is not set in .env. Falling back to mock news."
      );
      return mockNews;
    }

    const query =
      "Indian stock market OR Sensex OR Nifty OR BSE OR NSE OR India shares";
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });
    const articles = response.data.articles.map((article) => ({
      id: article.url,
      title: article.title,
      link: article.url,
      source: article.source.name,
      date: article.publishedAt,
    }));

    const cleanArticles = articles.filter(
      (article) => article.title && article.link
    );

    console.log(`Fetched ${cleanArticles.length} articles from NewsAPI.org.`);
    return cleanArticles;
  } catch (error) {
    console.error("Error fetching news from NewsAPI.org:", error.message);
    if (error.response) {
      console.error("NewsAPI.org response data:", error.response.data);
      console.error("NewsAPI.org response status:", error.response.status);
      console.error("NewsAPI.org response headers:", error.response.headers);
    } else if (error.request) {
      console.error("NewsAPI.org request error:", error.request);
    } else {
      console.error("Error", error.message);
    }
    console.warn("Falling back to mock news due to API error.");

    return mockNews;
  }
}

export function filterNewsByPortfolio(articles, portfolioSymbols) {
  // Basic validation
  if (
    !articles ||
    articles.length === 0 ||
    !portfolioSymbols ||
    portfolioSymbols.length === 0
  ) {
    console.warn(
      "filterNewsByPortfolio: Insufficient inputs (articles or portfolioSymbols are empty)."
    );
    return [];
  }

  const symbolRegexes = portfolioSymbols.map((symbol) => {
    const keyword = symbol.split(".")[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp(`\\b${keyword}\\b|${keyword}`, "i");
  });

  const filteredArticles = articles
    .filter((article) => {
      if (!article.title && !article.description) return false;

      const textToSearch = `${article.title || ""} ${
        article.description || ""
      }`;

      return symbolRegexes.some((regex) => regex.test(textToSearch));
    })
    .map((article) => ({
      ...article,
      symbol:
        portfolioSymbols.find((s) => {
          const keyword = s
            .split(".")[0]
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, "i");
          const textToSearch = `${article.title || ""} ${
            article.description || ""
          }`;
          return regex.test(textToSearch);
        }) || "N/A",
    }));

  console.log(`Filtered ${filteredArticles.length} articles for portfolio.`);
  return filteredArticles;
}
