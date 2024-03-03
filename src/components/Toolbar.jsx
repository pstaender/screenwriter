import { useCallback, useEffect, useState } from "react";
import { Importer } from "../lib/Importer";
import Dropzone from "./Dropzone";

import "./Toolbar.scss";
import {
  loadJSONDataToLocalStorage,
  loadPlainTextToLocalStorage,
  resetDocument
} from "../lib/helper";
import { Settings } from "./Settings";

export function Toolbar({
  setSeed,
  downloadScreenplay,
  setIntervalDownload,
  setEditMetaData,
  setMetaData,
  focusMode,
  setFocusMode,
  fileImportAndExport,
  setShowSettings,
  showSettings
} = {}) {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  function resetCurrentDocument() {
    resetDocument({ setMetaData, setSeed });
  }

  useEffect(() => {
    if (darkMode) {
      document.querySelector("body").classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.querySelector("body").classList.remove("dark-mode");
      localStorage.setItem("darkMode", "");
    }
  }, [darkMode]);

  const onDrop = useCallback((acceptedFiles) => {
    // Loop through accepted file(s)
    acceptedFiles.map((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (e.target.result) {
          resetCurrentDocument();
          let data = null;
          try {
            if (file.type === "application/json") {
              data = JSON.parse(e.target.result);
              loadJSONDataToLocalStorage(data);
              setDownloadFormat("json");
            } else {
              // plaintext
              data = loadPlainTextToLocalStorage(e.target.result);
              setDownloadFormat("txt");
            }
          } catch (e) {
            console.error(e);
            alert(
              `Could not import file '${file.name}'\n\n${e.message.trim()}`
            );
            return;
          }
          setMetaData(data.metaData);
          setSeed(Math.random());
        }
      };
      // onload callback gets called after the reader reads the file data
      reader.readAsText(file);

      return file;
    });
  }, []);

  const autoSaveIntervalInMilliSeconds = Number(
    localStorage.getItem("autosave")
  );
  const downloadIntervalInSeconds = 5;

  const [autoSave, setAutoSave] = useState(autoSaveIntervalInMilliSeconds > 0);
  const [downloadFormat, setDownloadFormat] = useState(
    localStorage.getItem("exportFormat") || null
  );
  const [autoScroll, setAutoScroll] = useState(
    localStorage.getItem("autoScrollToCurrentElement") === "true"
  );

  function handleToggleAutoSave() {
    setAutoSave(!autoSave);
  }

  function handleEditMetadata() {
    setEditMetaData(true);
    if (focusMode) {
      toggleFocusMode();
    }
  }

  function toggleFocusMode() {
    setFocusMode(!focusMode);
  }

  useEffect(() => {
    setIntervalDownload(autoSave ? downloadIntervalInSeconds * 1000 : null);
  }, [autoSave]);

  useEffect(() => {
    localStorage.setItem(
      "autoScrollToCurrentElement",
      autoScroll ? "true" : "false"
    );
  }, [autoScroll]);

  useEffect(() => {
    if (downloadFormat) {
      if (downloadFormat !== "json" && downloadFormat !== "txt") {
        throw new Error(`Only json and txt are allowed`);
      }
      localStorage.setItem("exportFormat", downloadFormat);
    }
  }, [downloadFormat]);

  return (
    <div id="screenwriter-toolbar">
      {fileImportAndExport && (
        <>
          <Dropzone
            onDrop={onDrop}
            accept={{
              "plain/txt": [".txt"],
              "application/json": [".json"]
            }}
          />
          <div className="icons">
            <div
              className="icon show-more-icons vertical"
              data-help={`Download`}
            >
              <i
                className="gg-arrow-down-o"
                onClick={(ev) => {
                  if (ev.currentTarget === ev.target) {
                    downloadScreenplay();
                  }
                }}
              ></i>
              <div className="icons">
                <div
                  className={[
                    "icon",
                    downloadFormat === "json" ? "active" : ""
                  ].join(" ")}
                  onClick={() => {
                    setDownloadFormat("json");
                    downloadScreenplay("json");
                  }}
                  data-help="as JSON file"
                >
                  <i className="gg-brackets"></i>
                </div>
                <div
                  className={[
                    "icon",
                    downloadFormat === "txt" ? "active" : ""
                  ].join(" ")}
                  onClick={() => {
                    setDownloadFormat("txt");
                    downloadScreenplay("txt");
                  }}
                  data-help="as plain-text file"
                >
                  <i className="gg-font-height"></i>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="icon">
        <i className="gg-performance" onClick={() => {
            setShowSettings(true);
        }}></i>
      </div>

      {showSettings && <Settings setMetaData={setMetaData} darkMode={darkMode} setDarkMode={setDarkMode} setShowSettings={setShowSettings} autoScroll={autoScroll} setAutoScroll={setAutoScroll} focusMode={focusMode} setFocusMode={setFocusMode} handleEditMetadata={handleEditMetadata}></Settings>}
    </div>
  );
}

// localStorage.getItem('autoScrollToCurrentElement') === 'true'
