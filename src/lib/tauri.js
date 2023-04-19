import { open, save } from '@tauri-apps/api/dialog';
import { readTextFile, readBinaryFile, writeTextFile, writeBinaryFile } from '@tauri-apps/api/fs';
import { loadJSONDataToLocalStorage, loadPlainTextToLocalStorage } from './helper';
import JSZip from 'jszip';
import { Exporter } from './Exporter';

export async function openAndReadScreenwriterFile() {
    let result = await open({
        filters: [{
            name: 'default',
            extensions: ['json', 'txt', 'screenwriter']
        }],
        multiple: false,
    })
    let data = null;
    if (!result) {
        return null;
    }
    localStorage.setItem('lastImportFile', result);
    if (result.endsWith('.json')) {
        let content = await readTextFile(result);
        data = JSON.parse(content);
        loadJSONDataToLocalStorage(data);
    } else if (result.endsWith('.txt')) {
        let content = await readTextFile(result);
        data = loadPlainTextToLocalStorage(content);
    } else if (result.endsWith('.screenwriter')) {
        let binaryData = await readBinaryFile(result);
        let res = await JSZip.loadAsync(binaryData);
        data = JSON.parse(await res.file('screenplay.json').async("string"))
        if (Object.keys(data).length === 0) {
            data = {
                sections: [{
                    html: '',
                    classification: 'text',
                }],
                metaData: {},
            }
        }
        loadJSONDataToLocalStorage(data);
    }
    return data;
}

export async function saveScreenwriterFile(fileName = null, { metaData, sections } = {}) {


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

    if (fileName) {
        if (fileName.endsWith('.json')) {
            format = 'json';
        }
        if (fileName.endsWith('.txt')) {
            format = 'txt';
        }
    }


    if (!fileName) {
        fileName = await save({
            filters: [{
                name: 'default',
                extensions: ['screenwriter', 'json', 'txt']
            }],
        });
        if (fileName) {
            localStorage.setItem('lastImportFile', fileName);
        }
    }

    let content = await exportDataOfCurrentScreenplay(format);


    if (format === 'screenwriter') {
        let zip = new JSZip();
        zip.file("screenplay.json", content);
        let zipResult = await zip.generateAsync({ type: "blob" })//({type:"blob"})//
        await writeBinaryFile(fileName, await zipResult.arrayBuffer())
    } else {
        await writeTextFile(fileName, content);
    }
}


