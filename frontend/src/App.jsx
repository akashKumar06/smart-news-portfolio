import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import Header from "./components/Header";
import NotificationSettings from "./components/NotificationSettings";
import PortfolioInput from "./components/PortfolioInput";
import MarketSentimentDisplay from "./components/MarketSentimentDisplay";
import FilteredNewsList from "./components/FilteredNewsList";
import GeneralNewsList from "./components/GeneralNewsList";
import LoadingIndicator from "./components/LoadingIndicator";
import ErrorMessage from "./components/ErrorMessage";

function App() {
  const [portfolioSymbols, setPortfolioSymbols] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [filteredNewsWithSentiment, setFilteredNewsWithSentiment] = useState(
    []
  );
  const [generalNews, setGeneralNews] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState(null);

  const [loadingPortfolioNews, setLoadingPortfolioNews] = useState(false);
  const [loadingGeneralNews, setLoadingGeneralNews] = useState(false);
  const [loadingMarketSentiment, setLoadingMarketSentiment] = useState(false);

  const [errorPortfolioNews, setErrorPortfolioNews] = useState(null);
  const [errorGeneralNews, setErrorGeneralNews] = useState(null);
  const [errorMarketSentiment, setErrorMarketSentiment] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSymbolsChange = (e) => {
    setPortfolioSymbols(e.target.value);
    localStorage.setItem("userPortfolioSymbols", e.target.value);
  };

  const handleEmailChange = (e) => {
    setNotificationEmail(e.target.value);
    localStorage.setItem("notificationEmail", e.target.value);
  };

  // --- Fetch General Market Sentiment ---
  const fetchMarketSentiment = useCallback(async () => {
    setLoadingMarketSentiment(true);
    setErrorMarketSentiment(null);
    try {
      const response = await axios.get(`${backendUrl}/news/general-sentiment`);
      setMarketSentiment(response.data);
    } catch (err) {
      console.error("Error fetching general market sentiment:", err);
      setErrorMarketSentiment("Failed to load general market sentiment.");
    } finally {
      setLoadingMarketSentiment(false);
    }
  }, [backendUrl]);

  // --- Fetch General News Articles ---
  const fetchGeneralNewsArticles = useCallback(async () => {
    setLoadingGeneralNews(true);
    setErrorGeneralNews(null);
    try {
      const response = await axios.get(`${backendUrl}/news/general`, {
        params: { query: "stock market India", endpoint: "top-headlines" },
      });
      setGeneralNews(response.data);
    } catch (err) {
      console.error("Error fetching general news articles:", err);
      setErrorGeneralNews("Failed to load general news articles.");
    } finally {
      setLoadingGeneralNews(false);
    }
  }, [backendUrl]);

  // --- Fetch Filtered News for Portfolio ---
  const fetchFilteredNews = useCallback(async () => {
    setLoadingPortfolioNews(true);
    setErrorPortfolioNews(null);
    setFilteredNewsWithSentiment([]);

    try {
      const symbolsArray = portfolioSymbols
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      if (symbolsArray.length === 0) {
        setErrorPortfolioNews("Please enter at least one portfolio symbol.");
        setLoadingPortfolioNews(false);
        return;
      }

      const response = await axios.post(`${backendUrl}/news/filtered`, {
        portfolioSymbols: symbolsArray,
        notificationEmail,
      });
      setFilteredNewsWithSentiment(response.data);
      console.log("Filtered news with sentiment:", response.data);
    } catch (err) {
      console.error("Error fetching filtered news:", err);
      setErrorPortfolioNews(
        "Failed to load portfolio news. Please check symbols and try again."
      );
    } finally {
      setLoadingPortfolioNews(false);
    }
  }, [portfolioSymbols, notificationEmail, backendUrl]);

  // --- Initial data fetch and periodic refresh intervals ---
  useEffect(() => {
    fetchMarketSentiment();
    fetchGeneralNewsArticles();

    const marketSentimentIntervalId = setInterval(fetchMarketSentiment, 300000);
    const generalNewsIntervalId = setInterval(fetchGeneralNewsArticles, 600000);

    return () => {
      clearInterval(marketSentimentIntervalId);
      clearInterval(generalNewsIntervalId);
    };
  }, [fetchMarketSentiment, fetchGeneralNewsArticles]);

  // --- Render UI ---
  return (
    <div className="font-sans max-w-5xl mx-auto p-5 border border-gray-200 rounded-lg shadow-md my-5 bg-white">
      <div className="space-y-8">
        <Header />

        {/* Notification Settings Section */}
        <div className="w-full">
          <NotificationSettings
            notificationEmail={notificationEmail}
            handleEmailChange={handleEmailChange}
          />
        </div>

        {/* Portfolio Input Section */}
        <div className="w-full">
          <PortfolioInput
            portfolioSymbols={portfolioSymbols}
            handleSymbolsChange={handleSymbolsChange}
            fetchFilteredNews={fetchFilteredNews}
            loading={loadingPortfolioNews}
          />
        </div>

        {/* Market Sentiment Display Section */}
        <div className="w-full">
          <MarketSentimentDisplay
            marketSentiment={marketSentiment}
            loading={loadingMarketSentiment}
            error={errorMarketSentiment}
          />
        </div>

        {/* Section for Filtered News */}
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Filtered News For Your Portfolio
          </h2>
          {loadingPortfolioNews && (
            <LoadingIndicator message="Fetching and analyzing portfolio news..." />
          )}
          {errorPortfolioNews && <ErrorMessage message={errorPortfolioNews} />}
          {!loadingPortfolioNews &&
            !errorPortfolioNews &&
            filteredNewsWithSentiment.length === 0 &&
            portfolioSymbols.trim().length > 0 && (
              <p className="text-center text-gray-500">
                No filtered news found for your portfolio. Try different symbols
                or check back later.
              </p>
            )}
          {!loadingPortfolioNews &&
            !errorPortfolioNews &&
            filteredNewsWithSentiment.length > 0 && (
              <FilteredNewsList news={filteredNewsWithSentiment} />
            )}
        </div>

        {/* Section for General News Display */}
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            General Market News
          </h2>
          {loadingGeneralNews && (
            <LoadingIndicator message="Loading general market news..." />
          )}
          {errorGeneralNews && <ErrorMessage message={errorGeneralNews} />}
          {!loadingGeneralNews &&
            !errorGeneralNews &&
            generalNews.length === 0 && (
              <p className="text-center text-gray-500">
                No general news available.
              </p>
            )}
          {!loadingGeneralNews &&
            !errorGeneralNews &&
            generalNews.length > 0 && <GeneralNewsList news={generalNews} />}
        </div>
      </div>
    </div>
  );
}

export default App;
