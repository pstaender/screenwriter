import { useEffect, useRef } from "react";
import "./Settings.scss";
import Voca from "voca";
import { Toggle } from "./Toggle";
import * as keyboardShortcuts from "../keyboardShortcuts.json";
import bmc from "../icons/bmc-button.png";

export function Settings({
  settings,
  setSettings,
  setShowSettings,
  handleEditMetadata,
  darkMode,
  setDarkMode,
  autoScroll,
  setAutoScroll,
  focusMode,
  setFocusMode
} = {}) {
  const ref = useRef(null);

  const handleClickOutside = (event) => {
    if (event.target.classList.contains("gg-performance")) {
      return;
    }
    if (ref.current && !ref.current.contains(event.target)) {
      setShowSettings(false);
    }
  };

  function clickNearestToggle(ev) {
    ev.target.closest(".toggle").querySelector("input").click();
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div className="edit-settings">
      <div className="window-overlay" ref={ref}>
        <ul className="settings">
          <h2>Settings</h2>
          <li className="toggle">
            <div className="label" onClick={clickNearestToggle}>
              Invert UI (light/dark mode)
            </div>
            <Toggle
              id="darkMode"
              label="Dark Mode"
              defaultChecked={darkMode}
              onChange={(ev) => setDarkMode(ev.target.checked)}
            />
          </li>
          <li className="toggle">
            <div className="label" onClick={clickNearestToggle}>
              Auto-Scroll
            </div>
            <Toggle
              id="autoScroll"
              label="Auto Scroll"
              defaultChecked={autoScroll}
              onChange={(ev) => setAutoScroll(ev.target.checked)}
            />
          </li>
          <li className="toggle">
            <div className="label" onClick={clickNearestToggle}>
              Focus-Mode
            </div>
            <Toggle
              id="focusMode"
              label="Focus Mode"
              defaultChecked={focusMode}
              onChange={(ev) => setFocusMode(ev.target.checked)}
            />
          </li>
          {window.__TAURI__ && (
            <>
              <li className="toggle">
                <div className="label" onClick={clickNearestToggle}>
                  Save History
                </div>
                <Toggle
                  id="saveHistory"
                  label="Save History"
                  defaultChecked={
                    localStorage.getItem("saveHistory") === "true"
                  }
                  onChange={(ev) =>
                    localStorage.setItem("saveHistory", ev.target.checked)
                  }
                />
              </li>
              <li className="toggle">
                <div className="label" onClick={clickNearestToggle}>
                  Auto increase last number on filename (version)
                </div>
                <Toggle
                  id="increaseLastNumberOnFilename"
                  label="Increase Number"
                  defaultChecked={
                    localStorage.getItem("increaseLastNumberOnFilename") ===
                    "true"
                  }
                  onChange={(ev) =>
                    localStorage.setItem(
                      "increaseLastNumberOnFilename",
                      ev.target.checked
                    )
                  }
                />
              </li>
            </>
          )}
          <li className="toggle">
            <div className="label" onClick={clickNearestToggle}>
              Do not write meta-data on plain text files
            </div>
            <Toggle
              id="excludeMetaDataOnPlainText"
              label="Exclude MetaData"
              defaultChecked={
                localStorage.getItem("excludeMetaDataOnPlainText") === "true"
              }
              onChange={(ev) =>
                localStorage.setItem(
                  "excludeMetaDataOnPlainText",
                  ev.target.checked
                )
              }
            />
          </li>
        </ul>

        {keyboardShortcuts?.default && (
          <>
            <details className="keyboardshortcuts">
              <summary>Keyboard Shortcuts</summary>
              <br></br>
              <ul>
                {Object.keys(keyboardShortcuts.default).map((key, i) => (
                  <li key={`ks-${i}`}>
                    <strong>{Voca.titleCase(key)}:</strong>{" "}
                    {keyboardShortcuts.default[key]}
                  </li>
                ))}
              </ul>
            </details>
            <br></br>
          </>
        )}

        <div style={{ textAlign: "right" }}>
          <p>
            <button className="button small" onClick={handleEditMetadata}>
              Edit Metadata
            </button>
          </p>
          <p>
            <a
              href="https://www.buymeacoffee.com/pstaender"
              target="_blank"
              style={{ display: "block" }}
            >
              <img
                src={bmc}
                alt="Buy me a coffe"
                style={{ height: "2rem" }}
              ></img>
            </a>
          </p>
        </div>

        <button
          className="button outline"
          onClick={() => setShowSettings(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
