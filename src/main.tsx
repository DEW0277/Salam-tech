import "./mock-server";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initApiAuth } from "./lib/api";

initApiAuth();

createRoot(document.getElementById("root")!).render(<App />);

// salom
