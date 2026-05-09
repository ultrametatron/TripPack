import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./store";
import { ThemeProvider } from "./theme";
import { PinGate } from "./components/PinGate";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <PinGate>
        <StoreProvider>
          <App />
        </StoreProvider>
      </PinGate>
    </ThemeProvider>
  </React.StrictMode>
);
