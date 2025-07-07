function LoadingIndicator({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
      <div
        className="
                animate-spin
                w-12 h-12
                border-4 border-t-4 border-blue-500 border-t-transparent
                rounded-full
                mb-3
            "
      ></div>
      <p className="text-lg text-blue-600 font-medium">{message}</p>
    </div>
  );
}

export default LoadingIndicator;
