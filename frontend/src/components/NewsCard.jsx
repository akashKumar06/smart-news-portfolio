import { FaExternalLinkAlt } from "react-icons/fa";

function NewsCard({ article, sentiment }) {
  const sentimentColor =
    sentiment === "Positive"
      ? "green"
      : sentiment === "Negative"
      ? "red"
      : "gray";
  const publishedDate = article.date
    ? new Date(article.date).toLocaleDateString()
    : "N/A";
  return (
    <div
      key={article.id}
      className="p-5 border border-gray-200 rounded-lg bg-white shadow-md
                                   hover:shadow-lg transform hover:-translate-y-1 transition duration-200 ease-in-out"
    >
      {sentiment && (
        <span
          className={`inline-block mb-2 px-2 py-1 text-xs font-semibold rounded-full bg-${sentimentColor}-100 text-${sentimentColor}-800`}
        >
          {sentiment}
        </span>
      )}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center w-full">
          <h4 className="text-lg font-semibold leading-tight mr-2 flex-grow">
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
        {/* Description */}
        {article.description && (
          <p className="text-sm text-gray-700">{article.description}</p>
        )}
        {/* Source and Date */}
        <div className="flex justify-between w-full flex-wrap">
          <p className="text-xs text-gray-500">
            Source: {article.source || "N/A"}
          </p>
          <p className="text-xs text-gray-500">Published: {publishedDate}</p>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
