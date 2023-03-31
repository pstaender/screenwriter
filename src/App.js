import { useCallback, useEffect, useState } from 'react';
import './App.scss';

import { Editor } from './components/Editor.js'
import { Exporter, convertDomSectionsToDataStructure } from './lib/Exporter';
import { useInterval } from 'usehooks-ts';
import { Toolbar } from './components/Toolbar';
import slugify from 'slugify';

let lastSavedExport = null;

export function App() {

    function currentScreenplay() {
        try {
            let data = localStorage.getItem('currentScreenplay')
            return JSON.parse(data);
        } catch (e) {
            if (!e.message.match('JSON')) {
                throw e;
            }
        }
        return {};
    }

    const [seed, setSeed] = useState(Math.random());
    const [intervalDownload, setIntervalDownload] = useState(null);
    const [editMetaData, setEditMetaData] = useState(false);
    const [metaData, setMetaData] = useState(currentScreenplay().metaData || {})

    function storeScreenplayInLocalStorage() {
        let sections = convertDomSectionsToDataStructure([...document.querySelectorAll('#screenwriter-editor > section > div')]);


        let data = {
            sections,
            // TODO metadata
            metaData,
        }
        if (data.sections?.length > 0) {
            // if error occurs, this may be empty…
            localStorage.setItem('currentScreenplay', JSON.stringify(data))
        }
        return data;
    }

    function downloadScreenplay() {
        let data = storeScreenplayInLocalStorage();
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
        let data = storeScreenplayInLocalStorage();
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
        {editMetaData && (
            <div className="edit-meta-data">
                <input name="title" onChange={(ev) => setMetaData({ ...metaData, ...{ title: ev.target.value } })} value={metaData.title} placeholder="Title"></input>
                <input name="author" onChange={(ev) => setMetaData({ ...metaData, ...{ author: ev.target.value } })} value={metaData.author} placeholder="Author"></input>
                <input name="copyright" onChange={(ev) => setMetaData({ ...metaData, ...{ copyright: ev.target.value } })} value={metaData.copyright} placeholder="Copyright"></input>
                <button onClick={() => setEditMetaData(false)}>Close</button>
            </div>
        )}
        <Editor key={seed} />
    </div>;
}
