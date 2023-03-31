import { useCallback, useEffect, useState } from 'react';
import './App.scss';

import { Editor } from './components/Editor.js'
import { Exporter, convertDomSectionsToDataStructure } from './lib/Exporter';
import { useInterval } from 'usehooks-ts';
import { Toolbar } from './components/Toolbar';
import slugify from 'slugify';
import { MetaDataEdit } from './components/MetaDataEdit';

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

    const [seed, setSeed] = useState(Math.random());
    const [intervalDownload, setIntervalDownload] = useState(null);
    const [editMetaData, setEditMetaData] = useState(false);
    const [metaData, setMetaData] = useState(currentScreenplay().metaData || {})

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
        let data = metaDataAndSections();
        let content = Exporter(data.sections, data.metaData);
        const mimeType = 'text/plain';
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
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        a.setAttribute('href', url);
        a.setAttribute('download', `${slugify(filename)}.txt`);
        a.click();
    }

    useInterval(() => {
        storeScreenplayInLocalStorage();
    }, 2000);

    useInterval(() => {
        let data = metaDataAndSections();
        let content = Exporter(data.sections, data.metaData);
        // only download if something has changed
        if (content !== lastSavedExport) {
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

    return <div>
        <Toolbar setSeed={setSeed} downloadScreenplay={downloadScreenplay} setIntervalDownload={setIntervalDownload} setEditMetaData={setEditMetaData} setMetaData={setMetaData}></Toolbar>
        {editMetaData && <MetaDataEdit metaData={metaData} setMetaData={setMetaData} setEditMetaData={setEditMetaData}></MetaDataEdit>}
        <Editor key={seed} />
    </div>;
}
