import LoadingIndicator from "./LoadingIndicator";
import ErrorMessage from "./ErrorMessage";

function MarketSentimentDisplay({ marketSentiment, loading, error }) {
  const getSentimentColorClass = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return "text-green-600";
      case "Negative":
        return "text-red-600";
      case "Neutral":
        return "text-gray-600";
      default:
        return "text-gray-700";
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading market sentiment..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!marketSentiment) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm text-center">
        <p className="text-gray-500">
          No market sentiment data available. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-3 text-blue-700">
        General Market Sentiment
      </h3>
      <p
        className={`text-2xl font-bold mb-2 ${getSentimentColorClass(
          marketSentiment.sentiment
        )}`}
      >
        Sentiment: {marketSentiment.sentiment}
      </p>
      <p className="text-base text-gray-700">
        Reasoning: {marketSentiment.reasoning}
      </p>
      {marketSentiment.compound !== undefined && (
        <p className="text-sm text-gray-500 mt-2">
          (Compound Score: {marketSentiment.compound.toFixed(2)})
        </p>
      )}
    </div>
  );
}

export default MarketSentimentDisplay;
