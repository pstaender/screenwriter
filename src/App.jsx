import { useEffect, useRef, useState } from "react";
import "./App.scss";

import { Editor } from "./components/Editor";
import { Exporter } from "./lib/Exporter";
import { useEventListener, useInterval } from "usehooks-ts";
import { Toolbar } from "./components/Toolbar";
import slugify from "slugify";
import { MetaDataEdit } from "./components/MetaDataEdit";
import { Cover } from "./components/Cover";
import { useVisibilityChange } from "./components/useVisibilityChange";

import {
  saveScreenwriterFile,
  ensureAppDir,
  importFileToLocalStorage,
  openAndReadScreenwriterFile
} from "./lib/tauri";
import { listen as listenOnTauriApp } from "@tauri-apps/api/event";
import {
  resetDocument,
  sectionsFromDocument,
  basenameOfPath
} from "./lib/helper";

import {
  confirm as confirmDialog,
  message as messageDialog,
  save
} from "@tauri-apps/api/dialog";
import { DocumentHistory } from "./components/DocumentHistory";
import { StatusLog } from "./components/StatusLog";
import { HR } from "./lib/HR";
import { jsPDF } from "jspdf";

let lastSavedExport = null;

export function App({ fileImportAndExport } = {}) {
  function currentScreenplay() {
    try {
      let data = localStorage.getItem("currentScreenplay");
      return JSON.parse(data) || {};
    } catch (e) {
      if (!e.message.match("JSON")) {
        throw e;
      }
    }
    return {};
  }

  fileImportAndExport = !!fileImportAndExport;

  const isVisible = useVisibilityChange();

  const [seed, setSeed] = useState(Math.random());
  const [intervalDownload, setIntervalDownload] = useState(null);
  const [editMetaData, setEditMetaData] = useState(false);
  const [metaData, setMetaData] = useState(currentScreenplay().metaData || {});
  const [focusMode, setFocusMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hideMousePointer, setHideMousePointer] = useState(false);
  const [showDocumentHistory, setShowDocumentHistory] = useState(false);
  const [statusLog, setStatusLog] = useState(null);
  const [showBottomTextInput, setShowBottomTextInput] = useState(false);
  const [bottomTextInputValue, setBottomTextInputValue] = useState(null);
  const bottomTextInputRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  const appRef = useRef(null);

  useEffect(() => {
    // we need for some elements a glocal focus selector…
    let body = document.querySelector("body");
    if (focusMode) {
      body.classList.add("focus");
      setHideMousePointer(true);
    } else {
      body.classList.remove("focus");
      setHideMousePointer(false);
    }
  }, [focusMode]);

  function metaDataAndSections() {
    return {
      sections: sectionsFromDocument(),
      metaData
    };
  }

  function generatePDF() {
    document.querySelector("body").classList.add("print");
    const doc = new jsPDF({ unit: "pt" });
    const pdfElement = document.getElementById("screenwriter");
    let filename = localStorage.getItem("lastImportFile") || "print";
    doc.html(pdfElement, {
      callback: async (pdf) => {
        if (window.__TAURI__) {
          let pdfData = pdf.output("arraybuffer");
          document.querySelector("body").classList.remove("print");
          filename = await save({
            filters: [
              {
                name: "default",
                extensions: ["pdf"]
              }
            ]
          });
          if (!filename) {
            filename = "print.pdf";
          }
          await writeBinaryFile(filename, pdfData);
        } else {
          await pdf.save(`${filename}.pdf`, { returnPromise: true });
        }
        document.querySelector("body").classList.remove("print");
      },
      autoPaging: "text"
    });
  }

  function storeScreenplayInLocalStorage() {
    let data = metaDataAndSections();
    if (
      data.sections?.length > 0 &&
      document.querySelector("#screenwriter-editor").textContent
    ) {
      data.metaData = { ...metaData };
      localStorage.setItem("currentScreenplay", JSON.stringify(data));
    }
    return data;
  }

  function downloadScreenplay(format = null) {
    if (!format) {
      format = localStorage.getItem("exportFormat") === "txt" ? "txt" : "json";
    }

    let data = metaDataAndSections();
    data.sections = data.sections.map((s) => {
      // select relevant values only
      return {
        html: s.html,
        classification: s.classification
      };
    });
    let mimeType = "text/plain";
    const timesignatur = new Date()
      .toISOString()
      .replace(/\.\d+[A-Z]$/, "")
      .replace(/:/g, "_");
    let filename = `screenplay_${timesignatur}`;
    if (data.metaData.title || data.metaData.author) {
      filename = [
        data.metaData.author,
        data.metaData.title || "screenplay",
        timesignatur
      ]
        .filter((v) => !!v)
        .join(" - ");
    }
    const a = document.createElement("a");
    let content = null;

    if (format === "json") {
      content = JSON.stringify(data);
      mimeType = "application/json";
    } else {
      content = Exporter(data.sections, data.metaData, {
        excludeMetaData:
          localStorage.getItem("excludeMetaDataOnPlainText") === "true"
      });
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `${slugify(filename.toLocaleLowerCase())}.${format}`
    );
    a.click();
  }

  async function autoSaveTauri(lastImportFile) {
    let appDataDir = await ensureAppDir();
    await saveScreenwriterFile(
      `${appDataDir}__backup__${basenameOfPath(lastImportFile)}`,
      metaDataAndSections()
    );
  }

  function removeSearchResults() {
    if (
      !document.querySelector("body").classList.contains("search-text-mode")
    ) {
      return;
    }
    document
      .querySelectorAll(`[contenteditable] span[data-hr]`)
      .forEach((el) => {
        let parent = el.closest("[contenteditable]");
        if (!parent) {
          return;
        }
        parent.textContent = parent.textContent + " ";
      });
    // document.querySelector('body').classList.remove('search-text-mode');
  }

  function findNextSearch({ reverseDirection } = {}) {
    let current = document.querySelector(
      `[contenteditable] span[data-hr].current`
    );
    if (!current) {
      current = document.querySelector(`[contenteditable] span[data-hr]`);
      if (!current) {
        return;
      }
      current.classList.add("current");
    } else {
      let marks = document.querySelectorAll(`[contenteditable] span[data-hr]`);
      let currentPos = [...marks]
        .map((e, i) => (e.classList.contains("current") ? i : null))
        .filter((e) => e !== null);
      current = null;
      currentPos = currentPos[0];
      if (reverseDirection) {
        document
          .querySelector(`[contenteditable] span[data-hr].current`)
          ?.classList?.remove("current");
        if (currentPos === 0) {
          current = [...marks].at(-1);
        } else {
          current = [...marks][currentPos - 1];
        }
        current.classList.add("current");
        current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
        return;
        // choose last
      } else if (currentPos === [...marks].length - 1) {
        current = [...marks].at(0);
        current.classList.add("current");
        current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
        return;
      } else {
        for (let el of marks) {
          if (current) {
            current = el;
            break;
          }
          if (el.classList.contains("current")) {
            current = el;
            el.classList.remove("current");
          }
        }
      }
    }
    if (current) {
      current.classList.add("current");
      current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
    }
  }

  async function handleKeyDownForTauri(ev) {
    if (ev.metaKey || ev.ctrlKey) {
      if (
        ev.key === "\\" &&
        window.__TAURI__ &&
        localStorage.getItem("lastImportFile")
      ) {
        setShowDocumentHistory(!showDocumentHistory);
      } else if (ev.key === "o") {
        let data = await openAndReadScreenwriterFile();
        if (data) {
          setMetaData(data.metaData || {});
          setSeed(Math.random());
        }
      } else if (ev.key === "p") {
        window.print();
      } else if (ev.key === "f") {
        if (
          document.querySelector("body").classList.contains("search-text-mode")
        ) {
          removeSearchResults();
          document.querySelector("body").classList.remove("search-text-mode");
        } else {
          setShowBottomTextInput("Search term");
          bottomTextInputRef.current?.focus();
          document.querySelector("body").classList.add("search-text-mode");
        }
      } else if (ev.key === "n") {
        let yes = await confirmDialog("Do you want to clear the document?");
        if (yes) {
          resetDocument({ setMetaData, setSeed });
        }
      } else if (ev.key === "s") {
        if (ev.shiftKey) {
          let { newFilename } = await saveScreenwriterFile(
            null,
            metaDataAndSections()
          );
          if (newFilename) {
            setStatusLog({
              message: `Saved to file ${newFilename}`,
              level: "ok"
            });
            localStorage.setItem("lastImportFile", newFilename);
          }
        } else {
          let { newFilename } = await saveScreenwriterFile(
            localStorage.getItem("lastImportFile"),
            metaDataAndSections()
          );
          let filename = newFilename || localStorage.getItem("lastImportFile");
          let isScreenwriterFile = filename.endsWith(".screenwriter");
          setStatusLog({
            message: `${
              isScreenwriterFile ? "Saved" : "Exported"
            } to file '${filename}'${
              isScreenwriterFile ? " with history" : ""
            }`,
            level: "ok"
          });
          if (newFilename) {
            localStorage.setItem("lastImportFile", newFilename);
          }
        }
      } else if (ev.key === "r") {
        console.debug("reload");
        storeScreenplayInLocalStorage();
        setSeed(Math.random());
      }
    }
  }

  async function jumpToScene(jumpTo = null) {
    // GOTO scene
    let selected =
      document.querySelector("#screenwriter-editor section.selected") ||
      document.querySelector("#screenwriter-editor section");

    let scenes = [];
    document
      .querySelectorAll("#screenwriter-editor > section.uppercase.description")
      .forEach((el) => {
        scenes.push(Number(el.getAttribute("data-index")));
      });

    function nearestScene() {
      let sceneNumberBefore = null;
      let previous = document.querySelector(
        "#screenwriter-editor section.selected"
      );

      while (previous) {
        if (
          previous.classList.contains("description") &&
          previous.classList.contains("uppercase")
        ) {
          sceneNumberBefore = previous.getAttribute("data-index");
          break;
        }
        previous = previous.previousElementSibling;
      }
      return previous ? scenes.indexOf(Number(sceneNumberBefore)) + 1 : "";
    }

    //jumpTo = prompt(`Which number of scene jump to?`, nearestScene() || '1')
    let jumpToSceneNumber = scenes[Number(jumpTo) - 1];

    if (!jumpTo) {
      return;
    }

    function selectSection(el) {
      if (!el) {
        return;
      }
      //setCurrentSectionById(el.querySelector('div').dataset['id']);
      el.querySelector("div") ? el.querySelector("div").focus() : el.focus();
    }

    if (jumpTo === "0") {
      // jump to 1st element
      selectSection(
        document.querySelector(`#screenwriter-editor > section:first-child`)
      );
    } else if (jumpToSceneNumber) {
      // jump to specified section
      selectSection(
        document.querySelector(
          `#screenwriter-editor > section.uppercase.description[data-index="${jumpToSceneNumber}"]`
        )
      );
    } else if (jumpTo.trim().toLocaleLowerCase().startsWith("e")) {
      // jump to last element
      selectSection(
        document.querySelector(`#screenwriter-editor > section:last-child`)
      );
    } else if (Number(jumpTo) > 1) {
      // jump to last scene
      selectSection(
        document.querySelector(
          `#screenwriter-editor > section.uppercase.description[data-index="${scenes.at(
            -1
          )}"]`
        )
      );
    }
  }

  function handleKeyDown(ev) {
    if ((ev.metaKey || ev.ctrlKey) && ev.shiftKey && ev.key === "P") {
      generatePDF();
    }
    if (window.__TAURI__) {
      try {
        handleKeyDownForTauri(ev).catch((err) => {
          console.error(err);
          messageDialog(err.message, { title: "Error", type: "error" });
        });
      } catch (e) {
        console.error(e);
        messageDialog(e.message, { title: "Error", type: "error" });
      }
    }
    if (ev.key === "Escape") {
      setEditMetaData(false);
      setShowSettings(false);
      return;
    }
    if (focusMode) {
      setHideMousePointer(true);
    }
    // shortcuts for app

    if ((ev.metaKey || ev.ctrlKey) && ev.key === ",") {
      setShowSettings(!showSettings);
    }

    if ((ev.metaKey || ev.ctrlKey) && ev.key === "g") {
      if (showBottomTextInput === "Jump to scene") {
        setShowBottomTextInput(false);
        return;
      }
      setShowBottomTextInput("Jump to scene");
      document.querySelector(".bottom-text-input")?.focus();
      return;
    }

    if (ev.metaKey || ev.ctrlKey) {
      if (ev.key === "0") {
        setFocusMode(!focusMode);
      }
      if (ev.key === "M") {
        setEditMetaData(true);
      }
      if (ev.shiftKey && ev.key === "S" && fileImportAndExport) {
        downloadScreenplay();
      }
    }
  }

  useInterval(() => {
    // only store, if tab is active
    if (!document.hidden) {
      storeScreenplayInLocalStorage();
    }
  }, 1000);

  useInterval(
    () => {
      let data = metaDataAndSections();
      let content = Exporter(data.sections, data.metaData, {
        excludeMetaData:
          localStorage.getItem("excludeMetaDataOnPlainText") === "true"
      });
      let sections = data.sections.filter((s) => !!s.html.trim());
      if (sections?.length == 0 || content === lastSavedExport) {
        return;
      }
      if (window.__TAURI__) {
        // creates an autosave in /$HOME/Library/Application Support/com.screenwriter.dev/__backup__$filename
        let file =
          localStorage.getItem("lastImportFile") ||
          localStorage.getItem("lastStoredFile");
        if (file) {
          autoSaveTauri(file)
            .then(() => {
              lastSavedExport = content;
            })
            .catch((err) => {
              //console.error(err);
            });
        }
      } else {
        downloadScreenplay();
        lastSavedExport = content;
      }
    },
    Number(intervalDownload) > 0 ? Number(intervalDownload) : null
  );

  useEventListener("keydown", handleKeyDown);

  useEffect(() => {
    localStorage.setItem("autosave", String(Number(intervalDownload)));
  }, [intervalDownload]);

  useEffect(() => {
    if (Object.keys(metaData).length > 0) {
      let screenplay = currentScreenplay();
      screenplay.metaData = metaData;
      localStorage.setItem("currentScreenplay", JSON.stringify(screenplay));
      let documentTitle = [metaData.author, metaData.title]
        .filter((s) => !!s)
        .join(" - ");
      document.title = documentTitle;
    }
  }, [metaData]);

  useEffect(() => {
    if (Number(localStorage.getItem("lastIndexOfCurrent")) >= 0) {
      setCurrentIndex(Number(localStorage.getItem("lastIndexOfCurrent")));
    }
  }, [seed]);

  useEffect(() => {
    if (!appRef) {
      return;
    }
    if (window.__TAURI__) {
      // https://github.com/tauri-apps/tauri/discussions/4736
      listenOnTauriApp("tauri://file-drop", async (event) => {
        let filePath = event.payload[0];
        if (filePath) {
          let data = await importFileToLocalStorage(filePath);
          setSeed(Math.random());
          setMetaData(data.metaData || {});
        }
      });
    }
  }, [appRef]);

  useEffect(() => {
    if (!showBottomTextInput) {
      return;
    }
    document.querySelector(".bottom-text-input")?.focus();
  }, [showBottomTextInput]);

  function handleEnterSearch(ev) {
    if (ev.key === "Escape") {
      ev.target.value = "";
      setShowBottomTextInput(false);
      setBottomTextInputValue(null);
      removeSearchResults();
      document.querySelector("body").classList.remove("search-text-mode");
      return;
    }

    let text = ev.target.value;
    if (ev.key !== "Enter") {
      return;
    }

    setBottomTextInputValue(text);

    if (document.querySelector("body").classList.contains("search-text-mode")) {
      ev.preventDefault();
      let reverseDirection = ev.shiftKey;
      if (text !== bottomTextInputValue) {
        removeSearchResults();
        new HR(`section [contenteditable="true"]`, {
          highlight: [ev.target.value]
        }).hr();
        setTimeout(() => {
          findNextSearch({ reverseDirection });
        }, 100);
      } else {
        findNextSearch({ reverseDirection });
      }
    } else {
      ev.preventDefault();
      // goto line
      jumpToScene(ev.target.value);
      setShowBottomTextInput(false);
    }
  }

  if (!window.__TAURI__) {
    // only required in webrowser, because the editor may be used in many tabs and needs to be synced
    useEffect(() => {
      if (isVisible) {
        // force reload
        setSeed(Math.random());
      } else {
        storeScreenplayInLocalStorage();
      }
    }, [isVisible]);
  }

  return (
    <div
      className={[
        focusMode ? "focus" : "",
        hideMousePointer ? "no-mouse-pointer" : ""
      ].join(" ")}
      onMouseMove={() => setHideMousePointer(false)}
      ref={appRef}
    >
      <Toolbar
        setSeed={setSeed}
        downloadScreenplay={downloadScreenplay}
        setIntervalDownload={setIntervalDownload}
        setEditMetaData={setEditMetaData}
        setMetaData={setMetaData}
        setFocusMode={setFocusMode}
        focusMode={focusMode}
        fileImportAndExport={fileImportAndExport}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      ></Toolbar>
      {editMetaData && (
        <MetaDataEdit
          metaData={metaData}
          setMetaData={setMetaData}
          setEditMetaData={setEditMetaData}
        ></MetaDataEdit>
      )}
      <Cover metaData={metaData}></Cover>
      <Editor
        key={`editor${seed}`}
        seed={seed}
        currentIndex={currentIndex}
        showDocumentHistory={showDocumentHistory}
      />
      {showDocumentHistory && (
        <DocumentHistory
          seed={seed}
          setMetaData={setMetaData}
          setShowDocumentHistory={setShowDocumentHistory}
          setSeed={setSeed}
          setStatusLog={setStatusLog}
        ></DocumentHistory>
      )}
      {statusLog && (
        <StatusLog
          statusLog={statusLog}
          setStatusLog={setStatusLog}
        ></StatusLog>
      )}
      {showBottomTextInput && (
        <input
          type="text"
          className="bottom-text-input"
          placeholder={showBottomTextInput}
          onKeyDown={handleEnterSearch}
          ref={bottomTextInputRef}
        ></input>
      )}
    </div>
  );
}

import "./Print.scss";
import { writeBinaryFile } from "@tauri-apps/api/fs";
// import './Story.scss';
