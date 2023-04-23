import { open, save } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';
import { readTextFile, readBinaryFile, writeTextFile, writeBinaryFile, createDir, exists, BaseDirectory } from '@tauri-apps/api/fs';
import { loadJSONDataToLocalStorage, loadPlainTextToLocalStorage } from './helper';
import JSZip from 'jszip';
import { Exporter } from './Exporter';
import { deltaOfData } from './JsonDiff';

export async function openAndReadScreenwriterFile() {
    let result = await open({
        filters: [{
            name: 'default',
            extensions: ['json', 'txt', 'screenwriter']
        }],
        multiple: false,
    })
    if (!result) {
        return null;
    }
    let data = await importFileToLocalStorage(result);
    return data;
}

export async function importFile(filename) {
    if (filename.endsWith('.json')) {
        let content = await readTextFile(filename);
        return {
            screenplay: JSON.parse(content)
        }
    } else if (filename.endsWith('.txt')) {
        let content = await readTextFile(filename);
        return {
            screenplay: loadPlainTextToLocalStorage(content)
        }
    } else if (filename.endsWith('.screenwriter')) {
        let {screenplay, history} = await readScreenwriterFile(filename);
        if (!screenplay.sections || Object.keys(screenplay.sections).length === 0) {
            screenplay = {
                sections: [{
                    html: '',
                    classification: 'text',
                }],
                metaData: screenplay.metaData || {},
            }
        }
        return { screenplay, history }
    }
}

export async function importFileToLocalStorage(filename) {
    localStorage.setItem('lastImportFile', filename);
    let data = null;
    if (filename.endsWith('.json')) {
        let content = await readTextFile(filename);
        data = JSON.parse(content);
        loadJSONDataToLocalStorage(data);
    } else if (filename.endsWith('.txt')) {
        let content = await readTextFile(filename);
        data = loadPlainTextToLocalStorage(content);
    } else if (filename.endsWith('.screenwriter')) {
        let { screenplay } = await readScreenwriterFile(filename);
        data = screenplay;
        if (!data || Object.keys(data).length === 0) {
            data = {
                sections: [{
                    html: '',
                    classification: 'text',
                }],
                metaData: {},
            }
        }
        loadJSONDataToLocalStorage({ ...{ sections: data.sections, metaData: data.metaData } });
    }
    return data;
}

async function readScreenwriterFile(filename) {
    let binaryData = await readBinaryFile(filename);
    let res = await JSZip.loadAsync(binaryData);
    let screenPlayJSON = await res.file('screenplay.json').async("string");
    let historyJSON = await res.file('history.json')?.async("string") || null;
   
    return {
        screenplay: JSON.parse(screenPlayJSON),
        history: historyJSON ? JSON.parse(historyJSON) : null,
    }
}

export async function saveScreenwriterFile(fileName = null, { metaData, sections } = {}, { saveHistory } = {}) {

    if (sections.length > 0) {
        sections = sections.map(s => {
            return {
                html: s.html.trim(),
                classification: s.classification.trim(),
            }
        })
    }

    async function exportDataOfCurrentScreenplay(format) {
        let data = { sections, metaData };// : JSON.parse(localStorage.getItem('currentScreenplay'));

        let content = null;
        if (format === 'json' || format === 'screenwriter') {
            content = JSON.stringify(data);
        } else {
            content = Exporter(data.sections, data.metaData);
        }
        return content;
    }

    let format = 'screenwriter';

    // console.log(fileName)

    let newFilename = null;

    if (!fileName) {
        fileName = await save({
            filters: [{
                name: 'default',
                extensions: ['screenwriter', 'json', 'txt']
            }],
        });
        if (!fileName) {
            // canceled
            return {};
        }
        newFilename = fileName;
    } else {
        newFilename = fileName;
    }

    if (newFilename.endsWith('.json')) {
        format = 'json';
    }
    if (newFilename.endsWith('.txt')) {
        format = 'txt';
    }

    let content = await exportDataOfCurrentScreenplay(format);

    if (format === 'screenwriter') {
        await saveScreenwriterFormat(newFilename, content, { saveHistory });
    } else {
        await writeTextFile(newFilename, content);
    }
    return {
        newFilename
    }
}

async function saveScreenwriterFormat(filename, content, { saveHistory } = {}) {
    let zip = new JSZip();
    zip.file("screenplay.json", content);
    if (saveHistory) {
        let currentScreenplay = JSON.parse(content);
        // load last state and history
        let screenplay = null;
        let history = null;
        if (await exists(filename)) {
            // console.debug('found previously existng file')
            let previousFile = await readScreenwriterFile(filename);
            screenplay = previousFile.screenplay;
            history = previousFile.history;
        }
        if (!history) {
            history = [];
        }
        if (screenplay) {
            console.debug('saving history')
            let newHistoryEntry = {
                created: new Date().toISOString(),
                payload: deltaOfData(currentScreenplay.sections.map(s => {
                    return {
                        html: s.html,
                        classification: s.classification,
                    }
                }), currentScreenplay.metaData, screenplay.sections, screenplay.metaData)
            }
            history.push(newHistoryEntry)
            zip.file("history.json", JSON.stringify(history));
        }
    }
    let zipResult = await zip.generateAsync({ type: "blob" })
    await writeBinaryFile(filename, await zipResult.arrayBuffer())
}

export async function ensureAppDir() {
    let appDir = await appDataDir();
    if (!await exists(appDir)) {
        createDir('', { dir: BaseDirectory.AppData, recursive: true })
    }
    return appDir;
}

