import { createRoot } from "react-dom/client";
import { App } from "./App.js";

const container = document.getElementById("screenwriter");
const root = createRoot(container);

root.render(<App />);
