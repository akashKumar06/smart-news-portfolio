import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import Header from "./components/Header";
import NotificationSettings from "./components/NotificationSettings";
import PortfolioInput from "./components/PortfolioInput";
import MarketSentimentDisplay from "./components/MarketSentimentDisplay";
import FilteredNewsList from "./components/FilteredNewsList";
import GeneralNewsList from "./components/GeneralNewsList";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";

function App() {
  const [portfolioSymbols, setPortfolioSymbols] = useState("");
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

  // --- Fetch General Market Sentiment ---
  const fetchMarketSentiment = useCallback(async () => {
    setLoadingMarketSentiment(true);
    setErrorMarketSentiment(null);
    try {
      const response = await axios.get(
        `${backendUrl}/api/news/general-sentiment`
      );
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
      const response = await axios.get(`${backendUrl}/api/news/general`, {
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

      const response = await axios.post(`${backendUrl}/api/news/filtered`, {
        portfolioSymbols: symbolsArray,
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
  }, [portfolioSymbols, backendUrl]);

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

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-2/5 flex-shrink-0 overflow-y-auto p-6 space-y-6 bg-gray-100/50 border-r border-gray-200">
          <div className="w-full">
            <MarketSentimentDisplay
              marketSentiment={marketSentiment}
              loading={loadingMarketSentiment}
              error={errorMarketSentiment}
            />
          </div>

          {/* Section for General News Display */}
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              General Market News
            </h2>
            {loadingGeneralNews && (
              <LoadingSpinner
                color="black"
                message="Loading general market news..."
              />
            )}
            {errorGeneralNews && <ErrorMessage message={errorGeneralNews} />}
            {!loadingGeneralNews &&
              !errorGeneralNews &&
              generalNews.length === 0 && (
                <p className="text-center text-gray-500 p-6 bg-white rounded-lg shadow-md">
                  No general news available.
                </p>
              )}
            {!loadingGeneralNews &&
              !errorGeneralNews &&
              generalNews.length > 0 && <GeneralNewsList news={generalNews} />}
          </div>
        </div>

        <div className="w-full md:w-3/5 overflow-y-auto p-6 space-y-6">
          <div className="w-full">
            <NotificationSettings initialEmail="user@example.com" />
          </div>

          <div className="w-full">
            <PortfolioInput
              portfolioSymbols={portfolioSymbols}
              handleSymbolsChange={handleSymbolsChange}
              fetchFilteredNews={fetchFilteredNews}
              loading={loadingPortfolioNews}
            />
          </div>

          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Filtered News For Your Portfolio
            </h2>
            {loadingPortfolioNews && (
              <LoadingSpinner
                color="black"
                message="Fetching and analyzing portfolio news..."
              />
            )}
            {errorPortfolioNews && (
              <ErrorMessage message={errorPortfolioNews} />
            )}
            {!loadingPortfolioNews &&
              !errorPortfolioNews &&
              filteredNewsWithSentiment.length === 0 && (
                <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                  <p>No filtered news to display.</p>
                  <p className="text-sm">
                    Enter stock symbols and click "Get Portfolio News" to begin.
                  </p>
                </div>
              )}
            {!loadingPortfolioNews &&
              !errorPortfolioNews &&
              filteredNewsWithSentiment.length > 0 && (
                <FilteredNewsList news={filteredNewsWithSentiment} />
              )}
          </div>
        </div>
      </main>
    </div>
  );
  // --- Render UI ---
  // return (
  //   <div className="font-sans max-w-5xl mx-auto p-5 border border-gray-200 rounded-lg shadow-md my-5 bg-white">
  //     <div className="space-y-8">
  //       <Header />

  //       {/* Notification Settings Section */}
  //       <div className="w-full">
  //         <NotificationSettings
  //           notificationEmail={notificationEmail}
  //           handleEmailChange={handleEmailChange}
  //         />
  //       </div>

  //       {/* Portfolio Input Section */}
  //       <div className="w-full">
  //         <PortfolioInput
  //           portfolioSymbols={portfolioSymbols}
  //           handleSymbolsChange={handleSymbolsChange}
  //           fetchFilteredNews={fetchFilteredNews}
  //           loading={loadingPortfolioNews}
  //         />
  //       </div>

  //       {/* Market Sentiment Display Section */}
  //       <div className="w-full">
  //         <MarketSentimentDisplay
  //           marketSentiment={marketSentiment}
  //           loading={loadingMarketSentiment}
  //           error={errorMarketSentiment}
  //         />
  //       </div>

  //       {/* Section for Filtered News */}
  //       <div className="w-full">
  //         <h2 className="text-2xl font-semibold mb-4 text-gray-800">
  //           Filtered News For Your Portfolio
  //         </h2>
  //         {loadingPortfolioNews && (
  //           <LoadingSpinner color="black" message="Fetching and analyzing portfolio news..." />
  //         )}
  //         {errorPortfolioNews && <ErrorMessage message={errorPortfolioNews} />}
  //         {!loadingPortfolioNews &&
  //           !errorPortfolioNews &&
  //           filteredNewsWithSentiment.length === 0 &&
  //           portfolioSymbols.trim().length > 0 && (
  //             <p className="text-center text-gray-500">
  //               No filtered news found for your portfolio. Try different symbols
  //               or check back later.
  //             </p>
  //           )}
  //         {!loadingPortfolioNews &&
  //           !errorPortfolioNews &&
  //           filteredNewsWithSentiment.length > 0 && (
  //             <FilteredNewsList news={filteredNewsWithSentiment} />
  //           )}
  //       </div>

  //       {/* Section for General News Display */}
  //       <div className="w-full">
  //         <h2 className="text-2xl font-semibold mb-4 text-gray-800">
  //           General Market News
  //         </h2>
  //         {loadingGeneralNews && (
  //           <LoadingSpinner color="black" message="Loading general market news..." />
  //         )}
  //         {errorGeneralNews && <ErrorMessage message={errorGeneralNews} />}
  //         {!loadingGeneralNews &&
  //           !errorGeneralNews &&
  //           generalNews.length === 0 && (
  //             <p className="text-center text-gray-500">
  //               No general news available.
  //             </p>
  //           )}
  //         {!loadingGeneralNews &&
  //           !errorGeneralNews &&
  //           generalNews.length > 0 && <GeneralNewsList news={generalNews} />}
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default App;
