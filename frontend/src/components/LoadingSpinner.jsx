const LoadingSpinner = ({ size = "md", color = "white" }) => {
  let spinnerSize = "w-6 h-6";
  if (size === "sm") spinnerSize = "w-4 h-4";
  if (size === "lg") spinnerSize = "w-8 h-8";

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${spinnerSize} border-2 border-t-2 border-${color} rounded-full animate-spin`}
        style={{ borderTopColor: "transparent" }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
