// src/components/ErrorMessage.jsx
import React from "react";

const ErrorMessage = ({ message, type = "error" }) => {
  let bgColor = "bg-red-100";
  let textColor = "text-red-700";
  let borderColor = "border-red-400";

  if (type === "success") {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
    borderColor = "border-green-400";
  } else if (type === "warning") {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-700";
    borderColor = "border-yellow-400";
  }

  return (
    <div
      className={`${bgColor} ${textColor} border ${borderColor} px-4 py-3 rounded relative`}
      role="alert"
    >
      <strong className="font-bold">
        {type === "success"
          ? "Success!"
          : type === "warning"
          ? "Warning!"
          : "Error!"}
      </strong>
      <span className="block sm:inline ml-2">{message}</span>
    </div>
  );
};

export default ErrorMessage;
