function PortfolioInput({
  portfolioSymbols,
  handleSymbolsChange,
  fetchFilteredNews,
  loading,
}) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Your Portfolio
      </h2>

      <div className="mb-6">
        <label
          htmlFor="portfolio-symbols"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Enter Stock Symbols (comma-separated):
        </label>
        <input
          type="text"
          id="portfolio-symbols"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g., RELIANCE.NS, TCS.NS, HDFCBANK.NS"
          value={portfolioSymbols}
          onChange={handleSymbolsChange}
        />
      </div>

      <button
        onClick={fetchFilteredNews}
        className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ease-in-out duration-150
                            ${
                              loading
                                ? "bg-blue-400 cursor-not-allowed opacity-70"
                                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" // Normal state styles
                            }`}
        disabled={loading}
      >
        {loading ? "Fetching News..." : "Get Portfolio News"}
      </button>
    </div>
  );
}

export default PortfolioInput;
