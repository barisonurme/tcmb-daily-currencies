import React from "react";

const LoadingSpinner = ({ styles }) => {
  return (
    <div
      className={`${styles} border-zinc-700 border-b-white rounded-full mr-2 mix-blend-screen animate-spin`}
    ></div>
  );
};

export default LoadingSpinner;
