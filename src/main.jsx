import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initFirebaseFromProxy } from "./firebase";

// Dynamically fetch configuration from proxy gateway before mounting
initFirebaseFromProxy().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});