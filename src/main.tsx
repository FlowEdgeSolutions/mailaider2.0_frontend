import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Office.js Ready‑Handler
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    const rootEl = document.getElementById("root");
    if (rootEl) {
      createRoot(rootEl).render(<App />);
    } else {
      console.error("Root container not found");
    }
  }
});
