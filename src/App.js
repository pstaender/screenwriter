import { useCallback, useState } from 'react';
import './App.scss';
import './Icons.scss';

import { Editor } from './components/Editor.js'
import Dropzone from './Dropzopne';
import { Importer } from './lib/Importer';
import { Exporter, convertDomSectionsToDataStructure } from './lib/Exporter';

export function App() {

    const [seed, setSeed] = useState(Math.random());

    const onDrop = useCallback(acceptedFiles => {
        // Loop through accepted files
        acceptedFiles.map(file => {
            // Initialize FileReader browser API
            const reader = new FileReader();
            reader.onload = function (e) {
                if (e.target.result) {
                    console.log(
                        Importer(e.target.result)
                    )
                    localStorage.setItem('currentScreenplay', JSON.stringify(Importer(e.target.result)))

                    setSeed(Math.random())
                }
            };
            // onload callback gets called after the reader reads the file data
            // Read the file as Data URL (since we accept only images)
            reader.readAsText(file);

            return file;
        });

    }, []);

    function storeScreenplay() {
        let sections = convertDomSectionsToDataStructure([...document.querySelectorAll('#screenwriter-editor > section > div')]);


        let data = {
            sections,
            // TODO metadata
            metaData: {},
        }
        if (data.sections?.length > 0) {
            // if error occurs, this may be empty…
            localStorage.setItem('currentScreenplay', JSON.stringify(data))
        }
        return data;
    }

    function downloadScreenplay() {
        let data = storeScreenplay();
        const content = Exporter(data.sections, data.metaData);
        const mimeType = 'text/plain';
        const filename = 'screenplay.txt'
        const a = document.createElement('a')
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob) // Create an object URL from blob
        a.setAttribute('href', url) // Set "a" element link
        a.setAttribute('download', filename) // Set download filename
        a.click() // Start downloading
    }

    return <div>
        <div className="toolbar">
            <Dropzone onDrop={onDrop} accept={"plain/txt"} />
            <div className="icon">
                <i className="gg-arrow-down-o" onClick={downloadScreenplay}></i>
            </div>
        </div>
        <Editor key={seed} />
    </div>;
}
