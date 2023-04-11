import { useCallback, useEffect, useState } from "react";
import { Importer } from "../lib/Importer";
import Dropzone from "./Dropzone"

import './Toolbar.scss';

export function Toolbar({ setSeed, downloadScreenplay, setIntervalDownload, setEditMetaData, setMetaData, focusMode, setFocusMode } = {}) {

    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true')
    const [showSuggestionBox, setShowSuggestionBox] = useState(localStorage.getItem('showSuggestionBox') === 'true')

    function resetDocument() {
        setSeed(Math.random())
        localStorage.setItem('currentScreenplay', '{}');
        localStorage.setItem('mementos', '[]');
        localStorage.setItem('lastIndexOfCurrent', 0);
        setMetaData({})
    }

    useEffect(() => {
        if (darkMode) {
            document.querySelector('body').classList.add('dark-mode')
            localStorage.setItem('darkMode', 'true')
        } else {
            document.querySelector('body').classList.remove('dark-mode')
            localStorage.setItem('darkMode', '')
        }
    }, [darkMode])

    const onDrop = useCallback(acceptedFiles => {
        // Loop through accepted file(s)
        acceptedFiles.map(file => {
            const reader = new FileReader();
            reader.onload = function (e) {

                if (e.target.result) {
                    resetDocument();
                    let data = null;
                    try {
                        if (file.type === 'application/json') {
                            data = JSON.parse(e.target.result);
                            localStorage.setItem('currentScreenplay', JSON.stringify({
                                sections: data.sections.map(s => {
                                    return {
                                        classification: s.classification,
                                        html: s.html,
                                    }
                                }),
                                // TODO: only allow specific fields / value?
                                metaData: data.metaData
                            }));
                            setDownloadFormat('json')
                        } else {
                            // plaintext
                            data = Importer(e.target.result.replace(/\t/g, '    '));
                            setDownloadFormat('txt')
                            localStorage.setItem('currentScreenplay', JSON.stringify(data));
                        }
                    } catch (e) {
                        console.error(e);
                        alert(`Could not import file '${file.name}'\n\n${e.message.trim()}`);
                        return;
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
    const [autoScroll, setAutoScroll] = useState(localStorage.getItem('autoScrollToCurrentElement') === 'true')

    function handleToggleAutoSave() {
        setAutoSave(!autoSave)
    }

    function handleEditMetadata() {
        setEditMetaData(true);
    }

    function toggleFocusMode() {
        setFocusMode(!focusMode);
    }

    useEffect(() => {
        setIntervalDownload(
            autoSave ? downloadIntervalInSeconds * 1000 : null
        );
    }, [autoSave])

    useEffect(() => {
        localStorage.setItem('autoScrollToCurrentElement', autoScroll ? 'true' : 'false')
    }, [autoScroll])

    useEffect(() => {
        if (downloadFormat) {
            if (downloadFormat !== 'json' && downloadFormat !== 'txt') {
                throw new Error(`Only json and txt are allowed`)
            }
            localStorage.setItem('exportFormat', downloadFormat)
        }
    }, [downloadFormat])

    useEffect(() => {
        localStorage.setItem('showSuggestionBox', showSuggestionBox ? 'true' : 'false')
    }, [showSuggestionBox])

    return (
        <div id="screenwriter-toolbar">
            <Dropzone onDrop={onDrop} accept={{
                "plain/txt": ['.txt'],
                "application/json": ['.json']
            }} />
            <div className="icons">
                <div className='icon show-more-icons' data-help={`Download`}>
                    <i className="gg-arrow-down-o" onClick={(ev) => {
                        if (ev.currentTarget === ev.target) {
                            downloadScreenplay()
                        }
                    }}></i>
                    <div className='icons'>
                        <div className={['icon', downloadFormat === 'json' ? 'active' : ''].join(' ')} onClick={() => {
                            setDownloadFormat('json');
                            downloadScreenplay('json');
                        }} data-help="as JSON file">
                            <i className="gg-brackets"></i>
                        </div>
                        <div className={['icon', downloadFormat === 'txt' ? 'active' : ''].join(' ')} onClick={() => {
                            setDownloadFormat('txt');
                            downloadScreenplay('txt');
                        }} data-help="as plain-text file">
                            <i className="gg-font-height"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className='icon show-more-icons'>
                <i className="gg-more-alt"></i>
                <div className='icons'>
                    <div className="icon" onClick={() => setDarkMode(!darkMode)} data-help="Dark Mode">
                        <i className="gg-dark-mode"></i>
                    </div>
                    <div className='icon' onClick={() => resetDocument()} data-help="Clear Document">
                        <i className="gg-trash"></i>
                    </div>
                    <div className={["icon", autoSave > 0 ? 'active' : ''].filter(e => !!e).join(' ')} onClick={handleToggleAutoSave} data-help="Download Backup every 60secs">
                        <i className="gg-timer"></i>
                    </div>
                    <div className={["icon", autoScroll ? 'active' : ''].join(' ')} onClick={() => setAutoScroll(!autoScroll)} data-help="Smooth auto scroll to current section">
                        <div style={{ transform: 'translateX(5px) translateY(5px)' }}>
                            <i className="gg-scroll-v"></i>
                        </div>
                    </div>
                    <div className={["icon", showSuggestionBox ? 'active' : ''].join(' ')} onClick={() => setShowSuggestionBox(!showSuggestionBox)} data-help="Show/Hide suggestions">
                        <div>
                            <i className="gg-menu-boxed"></i>
                        </div>
                    </div>
                    <div className={["icon", focusMode ? 'active' : ''].join(' ')} onClick={toggleFocusMode} data-help="Focus Mode (CTRL/META + 0)">
                        <div style={{ transform: 'translateX(-3px) translateY(-3px)' }}>
                            <i className="gg-eye"></i>
                        </div>
                    </div>
                    <div className='icon' onClick={handleEditMetadata} data-help="Edit Meta Data">
                        <div>
                            <i className="gg-notes" ></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// localStorage.getItem('autoScrollToCurrentElement') === 'true'
