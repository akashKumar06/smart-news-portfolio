import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { subscribeToNotifications } from "../services/api";
import { BsChevronBarUp, BsChevronDown, BsChevronUp } from "react-icons/bs";

function NotificationSettings({ initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [frequency, setFrequency] = useState("daily");
  const [notificationTypes, setNotificationTypes] = useState({
    generalSummary: true,
    portfolioAlerts: true,
  });
  const [portfolioSymbolsInput, setPortfolioSymbolsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("notificationEmail");
    const savedFrequency = localStorage.getItem("notificationFrequency");
    const savedTypes = localStorage.getItem("notificationTypes");
    const savedSymbols = localStorage.getItem("portfolioSymbols");

    if (savedEmail) setEmail(savedEmail);
    if (savedFrequency) setFrequency(savedFrequency);
    if (savedTypes) setNotificationTypes(JSON.parse(savedTypes));
    if (savedSymbols) setPortfolioSymbolsInput(savedSymbols);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const symbolsArray = portfolioSymbolsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    if (!email) {
      setMessage({ type: "error", text: "Email is required." });
      setLoading(false);
      return;
    }
    if (notificationTypes.portfolioAlerts && symbolsArray.length === 0) {
      setMessage({
        type: "error",
        text: 'Please enter portfolio symbols if "Personalized Portfolio Alerts" is selected.',
      });
      setLoading(false);
      return;
    }

    try {
      await subscribeToNotifications(
        email,
        frequency,
        notificationTypes,
        symbolsArray
      );

      setMessage({
        type: "success",
        text: "Subscription preferences saved successfully! A confirmation email has been sent.",
      });

      localStorage.setItem("notificationEmail", email);
      localStorage.setItem("notificationFrequency", frequency);
      localStorage.setItem(
        "notificationTypes",
        JSON.stringify(notificationTypes)
      );
      localStorage.setItem("portfolioSymbols", portfolioSymbolsInput);
    } catch (err) {
      console.error("Failed to subscribe/update:", err);
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to save preferences. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (e) => {
    setNotificationTypes({
      ...notificationTypes,
      [e.target.name]: e.target.checked,
    });
  };

  const [isOpen, setIsOpen] = useState(false);
  const handleStatus = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div
        className="flex justify-between cursor-pointer"
        onClick={handleStatus}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Subscribe for Email Notifications
        </h3>
        {isOpen ? <BsChevronUp /> : <BsChevronDown />}
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-sm rounded-md bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="frequency"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Notification Frequency:
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full p-2 text-sm rounded-md bg-white border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none pr-6 transition-all duration-200"
            >
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="off">Off</option>
            </select>
          </div>

          {/* Notification Types */}
          <div>
            <span className="block text-gray-700 text-sm font-medium mb-1">
              Notification Types:
            </span>
            <div className="flex flex-col gap-1">
              <label className="inline-flex items-center text-gray-800 text-sm">
                <input
                  type="checkbox"
                  name="generalSummary"
                  checked={notificationTypes.generalSummary}
                  onChange={handleTypeChange}
                  className="form-checkbox h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">General News Summary</span>
              </label>
              <label className="inline-flex items-center text-gray-800 text-sm">
                <input
                  type="checkbox"
                  name="portfolioAlerts"
                  checked={notificationTypes.portfolioAlerts}
                  onChange={handleTypeChange}
                  className="form-checkbox h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">
                  Personalized Portfolio Alerts
                </span>
              </label>
            </div>
          </div>

          {/* Portfolio Symbols Input (conditionally rendered) */}
          {notificationTypes.portfolioAlerts && (
            <div>
              <label
                htmlFor="portfolioSymbols"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Portfolio Symbols (comma-separated, e.g., RELIANCE.NS, TCS.NS):
              </label>
              <input
                type="text"
                id="portfolioSymbols"
                placeholder="Enter symbols if you want portfolio alerts"
                value={portfolioSymbolsInput}
                onChange={(e) => setPortfolioSymbolsInput(e.target.value)}
                className="w-full p-2 text-sm rounded-md bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-3 px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              "Subscribe / Update Preferences"
            )}
          </button>

          {message && (
            <div className="mt-2">
              <ErrorMessage message={message.text} type={message.type} />
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default NotificationSettings;
