import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("screenwriter");
const root = createRoot(container);

if (window.__TAURI__) {
    if (sessionStorage.getItem('keepCurrentScreenplay') !== 'true') {
        localStorage.setItem('currentScreenplay', '{}');
        localStorage.setItem('lastImportFile', '');
    }
    sessionStorage.setItem('keepCurrentScreenplay', 'true')
}

root.render(<App fileImportAndExport={!window.__TAURI__} />);
