import { useEffect, useRef, useState } from 'react';
import './App.scss';

import { Editor } from './components/Editor'
import { Exporter } from './lib/Exporter';
import { useEventListener, useInterval } from 'usehooks-ts';
import { Toolbar } from './components/Toolbar';
import slugify from 'slugify';
import { MetaDataEdit } from './components/MetaDataEdit';
import { Cover } from './components/Cover';
import { useVisibilityChange } from './components/useVisibilityChange';

import { saveScreenwriterFile, ensureAppDir, importFileToLocalStorage, openAndReadScreenwriterFile } from './lib/tauri';
import { listen as listenOnTauriApp } from '@tauri-apps/api/event'
import { resetDocument, sectionsFromDocument, basenameOfPath } from './lib/helper';

import { confirm as confirmDialog, message as messageDialog } from "@tauri-apps/api/dialog";
import { DocumentHistory } from './components/DocumentHistory';
import { StatusLog } from './components/StatusLog';

let lastSavedExport = null;

export function App({fileImportAndExport} = {}) {

    function currentScreenplay() {
        try {
            let data = localStorage.getItem('currentScreenplay')
            return JSON.parse(data) || {};
        } catch (e) {
            if (!e.message.match('JSON')) {
                throw e;
            }
        }
        return {
        };
    }

    fileImportAndExport = !!fileImportAndExport;
   
    const isVisible = useVisibilityChange();

    const [seed, setSeed] = useState(Math.random());
    const [intervalDownload, setIntervalDownload] = useState(null);
    const [editMetaData, setEditMetaData] = useState(false);
    const [metaData, setMetaData] = useState(currentScreenplay().metaData || {})
    const [focusMode, setFocusMode] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hideMousePointer, setHideMousePointer] = useState(false);
    const [showDocumentHistory, setShowDocumentHistory] = useState(false);
    const [statusLog, setStatusLog] = useState(null);

    const appRef = useRef(null);

    useEffect(() => {
        // we need for some elements a glocal focus selector…
        let body = document.querySelector('body');
        if (focusMode) {
            body.classList.add('focus');
            setHideMousePointer(true);
        } else {
            body.classList.remove('focus');
            setHideMousePointer(false);
        }
    }, [focusMode])

    function metaDataAndSections() {
        return {
            sections: sectionsFromDocument(),
            metaData,
        }
    }

    function storeScreenplayInLocalStorage() {
        let data = metaDataAndSections();
        if (data.sections?.length > 0 && document.querySelector('#screenwriter-editor').textContent) {
            data.metaData = {...metaData};
            localStorage.setItem('currentScreenplay', JSON.stringify(data))
        }
        return data;
    }

    function downloadScreenplay(format = null) {
        if (!format) {
            format = localStorage.getItem('exportFormat') === 'txt' ? 'txt' : 'json';
        }

        let data = metaDataAndSections();
        data.sections = data.sections.map(s => {
            // select relevant values only
            return {
                html: s.html,
                classification: s.classification,
            }
        })
        let mimeType = 'text/plain';
        const timesignatur = new Date().toISOString().replace(/\.\d+[A-Z]$/, '').replace(/:/g, '_');
        let filename = `screenplay_${timesignatur}`;
        if (data.metaData.title || data.metaData.author) {
           filename = [
            data.metaData.author,
            data.metaData.title || 'screenplay',
            timesignatur
           ].filter(v => !!v).join(' - ')
        }
        const a = document.createElement('a');
        let content = null;
        
        if (format === 'json') {
            content = JSON.stringify(data);
            mimeType = 'application/json';
        } else {
            content = Exporter(data.sections, data.metaData);
        }
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        a.setAttribute('href', url);
        a.setAttribute('download', `${slugify(filename.toLocaleLowerCase())}.${format}`);
        a.click();
    }

    async function autoSaveTauri(lastImportFile) {
        let appDataDir = await ensureAppDir()
        await saveScreenwriterFile(`${appDataDir}${basenameOfPath(lastImportFile)}`, metaDataAndSections())
    }

    async function handleKeyDownForTauri(ev) {
        if ((ev.metaKey || ev.ctrlKey)) {
            if (ev.key === '\\' && window.__TAURI__ && localStorage.getItem('lastImportFile')) {
                setShowDocumentHistory(!showDocumentHistory);
            } else if (ev.key === 'o') {
                let data = await openAndReadScreenwriterFile()
                if (data) {
                    setMetaData(data.metaData || {});
                    setSeed(Math.random());
                }
            } else if (ev.key === 'p') {
                window.print();
            } else if (ev.key === 'n') {
                let yes = await confirmDialog('Do you want to clear the document?')
                if (yes) {
                    resetDocument({setMetaData, setSeed});
                }
            } else if (ev.key === 's') {
                
                if (ev.shiftKey) {
                    let {newFilename} = await saveScreenwriterFile(null, metaDataAndSections())
                    if (newFilename) {
                        setStatusLog({
                            message: `Saved to file ${newFilename}`,
                            level: 'ok'
                        })
                        localStorage.setItem('lastImportFile', newFilename);
                    }
                } else {
                    let {newFilename} = await saveScreenwriterFile(localStorage.getItem('lastImportFile'), metaDataAndSections(), { saveHistory: true });
                    setStatusLog({
                        message: `Saved to file '${newFilename || localStorage.getItem('lastImportFile')}' with history`,
                        level: 'ok'
                    })
                    if (newFilename) {
                        
                        localStorage.setItem('lastImportFile', newFilename);
                    }
                }
            } else if (ev.key === 'r') {
                console.debug('reload')
                storeScreenplayInLocalStorage();
                setSeed(Math.random());
            }
        }
    }


    function handleKeyDown(ev) {
        if (ev.key === "Escape") {
            setEditMetaData(false);
            return;
        }
        if (focusMode) {
            setHideMousePointer(true);
        }
        // shortcuts for app
        if (window.__TAURI__) {
            try {
                handleKeyDownForTauri(ev).catch((err) => {
                    console.error(err);
                    messageDialog(err.message, { title: 'Error', type: 'error'});
                })
            } catch(e) {
                console.error(e);
                messageDialog(e.message, { title: 'Error', type: 'error'});
            }
        }
        if ((ev.metaKey || ev.ctrlKey)) {
            if (ev.key === '0') {
                setFocusMode(!focusMode);
            }
            if (ev.key === 'M') {
                setEditMetaData(true);
            }            
            if (ev.shiftKey && ev.key === 'S' && fileImportAndExport) {
                downloadScreenplay();
            }
        }
    }

    useInterval(() => {
        // only store, if tab is active
        if (!document.hidden) {
            storeScreenplayInLocalStorage();
        }
    }, 10000);

    useInterval(() => {
        let data = metaDataAndSections();
        let content = Exporter(data.sections, data.metaData);
        let sections = data.sections.filter(s => !!s.html.trim());
        if (sections?.length == 0 || content === lastSavedExport) {
            return;
        }
        if (window.__TAURI__) {
            // creates an autosave in /$HOME/Library/Application Support/com.screenwriter.dev 
            let lastImportFile = localStorage.getItem('lastImportFile');
            if (lastImportFile) {
                autoSaveTauri(lastImportFile).then(() => {
                    lastSavedExport = content;
                })
            }
        } else {
            downloadScreenplay();
            lastSavedExport = content;
        }
        
    }, Number(intervalDownload) > 0 ? Number(intervalDownload) : null);
    
    useEventListener('keydown', handleKeyDown);

    useEffect(() => {
        localStorage.setItem('autosave', String(Number(intervalDownload)));
    }, [intervalDownload])

    useEffect(() => {
        if (Object.keys(metaData).length > 0) {
            let screenplay = currentScreenplay();
            screenplay.metaData = metaData;
            localStorage.setItem('currentScreenplay', JSON.stringify(screenplay))
            let documentTitle = [metaData.author, metaData.title].filter(s => !!s).join(' - ')
            document.title = documentTitle;
        }
    }, [metaData])

    useEffect(() => {
        if (Number(localStorage.getItem('lastIndexOfCurrent')) >= 0) {
            setCurrentIndex(Number(localStorage.getItem('lastIndexOfCurrent')))
        }
    }, [seed])


    useEffect(() => {
        if (!appRef) {
            return;
        }
        // https://github.com/tauri-apps/tauri/discussions/4736
        listenOnTauriApp('tauri://file-drop', async (event) => {
            let filePath = event.payload[0];
            if (filePath) {
                let data = await importFileToLocalStorage(filePath)
                setSeed(Math.random())
                setMetaData(data.metaData || {});
            }
        })
    }, [appRef])

    useEffect(() => {
        if (isVisible) {
            // force reload
            setSeed(Math.random())
        } else {
            storeScreenplayInLocalStorage()
        }
    }, [isVisible])

    return <div className={[focusMode ? 'focus' : '', hideMousePointer ? 'no-mouse-pointer' : ''].join(' ')}  onMouseMove={() => setHideMousePointer(false) } ref={appRef}>
        <Toolbar setSeed={setSeed} downloadScreenplay={downloadScreenplay} setIntervalDownload={setIntervalDownload} setEditMetaData={setEditMetaData} setMetaData={setMetaData} setFocusMode={setFocusMode} focusMode={focusMode} fileImportAndExport={fileImportAndExport}></Toolbar>
        {editMetaData && <MetaDataEdit metaData={metaData} setMetaData={setMetaData} setEditMetaData={setEditMetaData}></MetaDataEdit>}
        <Cover metaData={metaData}></Cover>
        <Editor key={`editor${seed}`} seed={seed} currentIndex={currentIndex} showDocumentHistory={showDocumentHistory} />
        {showDocumentHistory && (
            <DocumentHistory seed={seed} setMetaData={setMetaData} setShowDocumentHistory={setShowDocumentHistory} setSeed={setSeed} setStatusLog={setStatusLog}></DocumentHistory>
        )}
        {statusLog && (
            <StatusLog statusLog={statusLog} setStatusLog={setStatusLog}></StatusLog>
        )}
    </div>;
}

import './Print.scss';

