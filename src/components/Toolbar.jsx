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
import JSZip from "jszip";

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

  async function loadScreenWriterFile(file) {
    let zip = await new JSZip().loadAsync(file);
    return {
      screenplay: JSON.parse(await zip.files["screenplay.json"].async("text")),
      // history could be very large, so we don't load it here
      history: null,//zip.files["history.json"] ? JSON.parse(await zip.files["history.json"].async("text")) : null,
    };
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
    function convertToPlainText(blob) {
      let enc = new TextDecoder("utf-8");
      let arr = new Uint8Array(blob);
      return enc.decode(arr);
    }
    // Loop through accepted file(s)
    acceptedFiles.map((file) => {
      const reader = new FileReader();
      reader.onload = async function (e) {
        if (e.target.result) {
          resetCurrentDocument();
          let data = null;
          try {
            let isScreenWriterFile = file.name
              .toLowerCase()
              .endsWith(".screenwriter");
            if (file.type === "application/json") {
              data = JSON.parse(convertToPlainText(e.target.result));
              loadJSONDataToLocalStorage(data);
              setDownloadFormat("json");
            } else if (file.type === "application/zip" || isScreenWriterFile) {
              let { screenplay, history } = await loadScreenWriterFile(e.target.result);
              // TODO: what do with history?
              data = screenplay;
              loadJSONDataToLocalStorage(data);
              setDownloadFormat("screenwriter");
            } else {
              // plaintext
              data = loadPlainTextToLocalStorage(
                convertToPlainText(e.target.result)
              );
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
      reader.readAsArrayBuffer(file);

      return file;
    });
  }, []);

  const autoSaveIntervalInMilliSeconds = Number(
    localStorage.getItem("autosave")
  );
  const downloadIntervalInSeconds = 120;

  const [autoSave, setAutoSave] = useState(autoSaveIntervalInMilliSeconds > 0);
  const [downloadFormat, setDownloadFormat] = useState(
    localStorage.getItem("exportFormat") || null
  );
  const [autoScroll, setAutoScroll] = useState(
    localStorage.getItem("autoScrollToCurrentElement") === "true"
  );

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
      if (downloadFormat !== "json" && downloadFormat !== "txt" && downloadFormat !== "screenwriter") {
        throw new Error(`Only json, txt and screenwriter are allowed`);
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
              "application/zip": [".screenwriter"],
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
                    downloadFormat === "screenwriter" ? "active" : ""
                  ].join(" ")}
                  onClick={() => {
                    setDownloadFormat("screenwriter");
                    downloadScreenplay("screenwriter");
                  }}
                  data-help="as Screenwriter file"
                >
                  <i className="gg-box"></i>
                </div>
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

      <div className="icon" style={localStorage.getItem('hideSettingsIcon') === 'true' ? {display: 'none'} : {}}>
        <i
          className="gg-performance"
          onClick={() => {
            setShowSettings(true);
          }}
        ></i>
      </div>

      {showSettings && (
        <Settings
          setMetaData={setMetaData}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setShowSettings={setShowSettings}
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          handleEditMetadata={handleEditMetadata}
          autoSave={autoSave}
          setAutoSave={setAutoSave}
        ></Settings>
      )}
    </div>
  );
}
