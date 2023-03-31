import { useCallback, useEffect, useState } from "react";
import { Importer } from "../lib/Importer";
import Dropzone from "./Dropzone"

import './Toolbar.scss';


export function Toolbar({ setSeed, downloadScreenplay, setIntervalDownload, setEditMetaData, setMetaData } = {}) {

    const onDrop = useCallback(acceptedFiles => {
        // Loop through accepted files
        acceptedFiles.map(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                
                if (e.target.result) {
                    let data = null;
                    if (file.type === 'application/json') {
                        try {
                            data = JSON.parse(e.target.result);
                            localStorage.setItem('currentScreenplay', JSON.stringify({
                                sections: data.sections,
                                metaData: data.metaData
                            }));
                        } catch (e) {
                            console.error(e);
                            alert(e.message);
                        }
                    } else {
                        // plaintext
                        data = Importer(e.target.result);
                        localStorage.setItem('currentScreenplay', JSON.stringify(data));
                    }
                    
                    setMetaData(data.metaData);
                    setSeed(Math.random());
                }
            };
            // onload callback gets called after the reader reads the file data
            // Read the file as Data URL (since we accept only images)
            reader.readAsText(file);

            return file;
        });

    }, []);

    const autoSaveIntervalInMilliSeconds = Number(localStorage.getItem('autosave'));
    const downloadIntervalInSeconds = 5;
 
    const [autoSave, setAutoSave] = useState(autoSaveIntervalInMilliSeconds > 0);
    const [downloadFormat, setDownloadFormat] = useState(localStorage.getItem('exportFormat') || null);

    function handleToggleAutoSave() {
        setAutoSave(!autoSave)
    }

    function handleEditMetadata() {
        setEditMetaData(true);
    }

    useEffect(() => {
        setIntervalDownload(
            autoSave ? downloadIntervalInSeconds * 1000 : null
        );
    }, [autoSave])

    return (
        <div id="screenwriter-toolbar">
            <Dropzone onDrop={onDrop} accept={["plain/txt", "application/json"]} />
            <div className="icons">
                <div className="icon" onClick={() => {
                    downloadScreenplay()
                }}>
                    <i className="gg-arrow-down-o"></i>
                </div>
                <div className='icon show-more-icons'>
                    <i className="gg-more-alt"></i>
                    <div className='icons'>
                        <div className="icon" onClick={() => document.querySelector('body').classList.toggle('dark-mode')}>
                            <i className="gg-dark-mode"></i>
                        </div>
                        <div className='icon' onClick={() => {
                            setSeed(Math.random())
                            localStorage.setItem('currentScreenplay', '{}')
                            setMetaData({})
                        }}>
                            <i className="gg-trash"></i>
                        </div>
                        <div className={["icon", autoSave > 0 ? 'active' : ''].filter(e => !!e).join(' ')} onClick={handleToggleAutoSave}>
                            <i className="gg-timer"></i>
                        </div>
                        <div className={['icon', downloadFormat === 'json' ? 'active' : ''].join(' ')} onClick={() => {
                            let format = downloadFormat === 'json' ? 'txt' : 'json';
                            setDownloadFormat(format);
                            localStorage.setItem('exportFormat', format)
                        }}>
                            <i className="gg-brackets"></i> 
                        </div>
                        <div className='icon' onClick={handleEditMetadata}>
                            <div>
                                <i className="gg-notes" ></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
