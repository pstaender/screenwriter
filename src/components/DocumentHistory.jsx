import { useEffect, useState } from "react"
import { importFile } from "../lib/tauri";
import { reverseDeltaPatch, reverseDeltaUnpatch } from "../lib/JsonDiff";

export function DocumentHistory({setShowDocumentHistory, setSeed, seed, setMetaData, setStatusLog}) {

    const [history, setHistory] = useState(null)
    const [screenplay, setScreenplay] = useState(null);
    const [selected, setSelected] = useState(null);

    async function loadHistoryFromFile() {
        const {screenplay, history} = await importFile(localStorage.getItem('lastImportFile'));
        if (history) {
            setHistory(history.reverse())
        }
        if (screenplay) {
            setScreenplay(screenplay)
        }
    }

    async function handleExit() {
        setHistory(null);
        setShowDocumentHistory(false);
    }

    async function handleShowCurrent() {
        setSelected(null)
        const {screenplay} = await importFile(localStorage.getItem('lastImportFile'));
        localStorage.setItem('currentScreenplay', JSON.stringify(screenplay))
        setSeed(Math.random())
    }

    function handleShowHistory(historyItem) {
        let restored = {...screenplay}
        try {
            for (let h of history) {
                if (h.created === historyItem.created) {
                    break;
                }
                restored = reverseDeltaPatch(restored.sections, restored.metaData, h.payload)
                restored.sections = [...restored.sections]
            }
        } catch (e) {
            setStatusLog({
                message: e.message,
                level: 'error',
            })
        }
        
        setMetaData(restored.metaData)
        // apply restored version to screen
        localStorage.setItem('currentScreenplay', JSON.stringify(restored))
        setSeed(Math.random())
    }

    function formatDate(dateIsoString) {
        return dateIsoString.replace(/\.\d+.*$/, '').replace('T', ' ')
    }

    useEffect(() => {
        loadHistoryFromFile()
    }, [seed])

    return (<div className="document-history aside-overview-box">
        <ul>
            <li className={selected === null ? 'selected' : ''} key='current' onClick={() => {
                handleShowCurrent();
                handleExit();
            }} onMouseEnter={handleShowCurrent}><a>Newest</a></li>
            {history && history.map((h,i) => (
                <li className={selected === h.created ? 'selected' : ''} key={h.created} onClick={() => {
                    handleShowHistory(h);
                    handleExit();
                }} onMouseEnter={() => {
                    handleShowHistory(h)
                    setSelected(h.created)
                }}><a>{history[i+1]?.created ? formatDate(h.created) : 'Initial Save'}</a></li>
            ))}
        </ul>
        <br></br>
        <a onClick={() => {
            handleExit()
            handleShowCurrent()
        }}>Close Recovery</a>
    </div>
    )
}
