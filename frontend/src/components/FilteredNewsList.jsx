import { BsArrowUpRight, BsArrowDownLeft, BsDash } from "react-icons/bs";
import { FaExternalLinkAlt } from "react-icons/fa";

function FilteredNewsList({ news }) {
  if (!news || news.length === 0) {
    return (
      <div className="text-center p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
        <p className="text-gray-500">
          No filtered news available for your portfolio.
        </p>
      </div>
    );
  }

  // Helper to get sentiment classes and icon component
  const getSentimentProps = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return {
          bgClass: "bg-green-100",
          textColorClass: "text-green-800",
          icon: BsArrowUpRight,
        };
      case "Negative":
        return {
          bgClass: "bg-red-100",
          textColorClass: "text-red-800",
          icon: BsArrowDownLeft,
        };
      case "Neutral":
        return {
          bgClass: "bg-gray-100",
          textColorClass: "text-gray-800",
          icon: BsDash,
        };
      default:
        return {
          bgClass: "bg-gray-100",
          textColorClass: "text-gray-800",
          icon: BsDash,
        };
    }
  };

  return (
    <div className="space-y-6">
      {news.map((article, index) => {
        const {
          bgClass,
          textColorClass,
          icon: SentimentIcon,
        } = getSentimentProps(article.sentiment);
        const publishedDate = article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString()
          : "N/A";

        return (
          <div
            key={index}
            className="p-5 border border-gray-200 rounded-lg bg-white shadow-md
                                   hover:shadow-lg transform hover:-translate-y-1 transition duration-200 ease-in-out"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-center w-full">
                <h4 className="text-lg font-semibold leading-tight mr-2 flex-grow">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                    {article.symbol}
                  </span>
                  {article.title}
                </h4>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 ml-auto"
                >
                  <FaExternalLinkAlt className="inline-block w-4 h-4" />
                </a>
              </div>
              {article.description && (
                <p className="text-sm text-gray-700">{article.description}</p>
              )}
              <div className="flex justify-between w-full flex-wrap">
                <p className="text-xs text-gray-500">
                  Source: {article.sourceName || "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  Published: {publishedDate}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgClass} ${textColorClass}`}
              >
                <SentimentIcon className="inline-block w-3 h-3 mr-1" />{" "}
                Sentiment: {article.sentiment}
              </span>
              {article.reasoning && (
                <p className="text-sm text-gray-600">
                  Reasoning: {article.reasoning}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FilteredNewsList;
