function ErrorMessage({ message }) {
  return (
    <div
      className="
            text-center p-4 rounded-lg shadow-sm
            bg-red-100 text-red-700 border border-red-300
            mb-5
        "
    >
      <p className="font-bold mb-2">Error:</p>
      <p>{message}</p>
      <p className="text-sm mt-2 text-red-600">
        Please try again or check your backend server.
      </p>
    </div>
  );
}

export default ErrorMessage;
