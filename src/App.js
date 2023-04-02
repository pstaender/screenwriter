import { useCallback, useEffect, useState } from 'react';
import './App.scss';

import { Editor } from './components/Editor.js'
import { Exporter, convertDomSectionsToDataStructure } from './lib/Exporter';
import { useInterval } from 'usehooks-ts';
import { Toolbar } from './components/Toolbar';
import slugify from 'slugify';
import { MetaDataEdit } from './components/MetaDataEdit';
import { Cover } from './components/Cover';
import { useVisibilityChange } from './components/useVisibilityChange';

let lastSavedExport = null;

export function App() {

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

   
    const isVisible = useVisibilityChange();

    const [seed, setSeed] = useState(Math.random());
    const [intervalDownload, setIntervalDownload] = useState(null);
    const [editMetaData, setEditMetaData] = useState(false);
    const [metaData, setMetaData] = useState(currentScreenplay().metaData || {})
    const [focusMode, setFocusMode] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // we need for some elements a glocal focus selector…
        if (focusMode) {
            document.querySelector('body').classList.add('focus');
        } else {
            document.querySelector('body').classList.remove('focus');
        }
    }, [focusMode])

    function metaDataAndSections() {
        let sections = convertDomSectionsToDataStructure([...document.querySelectorAll('#screenwriter-editor > section > div')]);
        return {
            sections,
            metaData,
        }
    }

    function storeScreenplayInLocalStorage() {
        let data = metaDataAndSections();
        if (data.sections?.length > 0 && document.querySelector('#screenwriter-editor').textContent) {
            // if error occurs, this may be empty…
            // console.debug(`Autosave`)
            localStorage.setItem('currentScreenplay', JSON.stringify(data))
        }
        return data;
    }

    function downloadScreenplay() {
        let format = localStorage.getItem('exportFormat') === 'json' ? 'json' : 'txt';
        let data = metaDataAndSections();
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

    function handleKeyDown(ev) {
        if ((ev.metaKey || ev.ctrlKey)) {
            if (ev.key === '0') {
                setFocusMode(!focusMode);
            }
        }
        
    }

    useInterval(() => {
        storeScreenplayInLocalStorage();
    }, 2000);

    useInterval(() => {
        let data = metaDataAndSections();
        let content = Exporter(data.sections, data.metaData);
        // only download if something has changed
        if (data.sections.filter(s => !!s.html.trim())?.length > 0 && content !== lastSavedExport) {
            downloadScreenplay();
            lastSavedExport = content;
        }
    }, Number(intervalDownload) > 0 ? Number(intervalDownload) : null);

    useEffect(() => {
        localStorage.setItem('autosave', String(Number(intervalDownload)));
    }, [intervalDownload])

    useEffect(() => {
        if (Object.keys(metaData).length > 0) {
            let screenplay = currentScreenplay();
            screenplay.metaData = metaData;
            localStorage.setItem('currentScreenplay', JSON.stringify(screenplay))
        }
    }, [metaData])

    useEffect(() => {
        if (localStorage.getItem('lastIndexOfCurrent')) {
            setCurrentIndex(Number(localStorage.getItem('lastIndexOfCurrent')))
        }
    }, [seed])

    useEffect(() => {
        if (isVisible) {
            // force reload
            setSeed(Math.random())
        } else {
            storeScreenplayInLocalStorage()
        }
    }, [isVisible])

    return <div className={[focusMode ? 'focus' : ''].join(' ')} onKeyDown={handleKeyDown}>
        <Toolbar setSeed={setSeed} downloadScreenplay={downloadScreenplay} setIntervalDownload={setIntervalDownload} setEditMetaData={setEditMetaData} setMetaData={setMetaData} setFocusMode={setFocusMode} focusMode={focusMode}></Toolbar>
        {editMetaData && <MetaDataEdit metaData={metaData} setMetaData={setMetaData} setEditMetaData={setEditMetaData}></MetaDataEdit>}
        <Cover metaData={metaData}></Cover>
        <Editor key={seed} seed={seed} currentIndex={currentIndex} />
    </div>;
}
