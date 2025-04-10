import React from "react";

const isActive = (href) => {
  if (!isClient) return "hover:text-gray-500"; // Default to non-active style
  const currentUrl = new URL(window.location.href);
  const targetUrl = new URL(href, window.location.origin);

  return currentUrl.pathname === targetUrl.pathname &&
    currentUrl.search === targetUrl.search
    ? "text-yellow-500"
    : "hover:text-gray-500";
};
export default isActive;
