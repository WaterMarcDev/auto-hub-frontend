import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Import Bootstrap CSS and other required stylesheets
import "bootstrap/dist/css/bootstrap.min.css";

// Import Ant Design CSS
import "antd/dist/reset.css";

// Import App CSS for layout
import "./App.css";

// Import custom layout CSS to fix positioning
import "./assets/css/custom-layout.css";

// Force dark theme on body load
document.addEventListener("DOMContentLoaded", () => {
  document.body.setAttribute("data-sidebar", "dark");
  document.body.setAttribute("data-layout-mode", "dark");
  document.documentElement.setAttribute("data-theme", "dark");
  document.body.classList.add("dark-theme");
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
