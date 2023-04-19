import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("screenwriter");
const root = createRoot(container);

root.render(<App fileImportAndExport={!window.__TAURI__} />);
