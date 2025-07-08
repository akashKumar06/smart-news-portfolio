function PortfolioInput({
  portfolioSymbols,
  handleSymbolsChange,
  fetchFilteredNews,
  loading,
}) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Your Portfolio
      </h3>
      <div className="space-y-3">
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
          disabled={loading}
          className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Fetching News..." : "Get Portfolio News"}
        </button>
      </div>
    </div>
  );
}

export default PortfolioInput;
