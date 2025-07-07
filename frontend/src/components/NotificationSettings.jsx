function NotificationSettings({ notificationEmail, handleEmailChange }) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Notification Settings
      </h2>

      <div className="mb-4">
        <label
          htmlFor="email-address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address for Notifications (Optional)
        </label>
        <input
          type="email"
          id="email-address"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g., your-email@example.com"
          value={notificationEmail}
          onChange={handleEmailChange}
        />
        <p className="mt-2 text-xs text-gray-500">
          Get email alerts for significant news about your portfolio.
        </p>
      </div>
    </div>
  );
}

export default NotificationSettings;
