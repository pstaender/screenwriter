import { useEffect } from 'react';
import './MetaDataEdit.scss';
import Voca from "voca";

export function MetaDataEdit({ metaData, setMetaData, setEditMetaData } = {}) {

    function setMetaDataByKey(key, value) {
        let data = {};
        data[key] = value;
        setMetaData({ ...metaData, ...data })
    }

    useEffect(() => {
        if (!metaData || Object.keys(metaData).length === 0) {
            setMetaData({
                title: '',
                author: '',
            });
        }
    },  [metaData]);

    return (
        <div className="edit-meta-data">
            {metaData && Object.entries(metaData).map((kv) => (
                <input key={`metadata_${kv[0]}`} onChange={(ev) => setMetaDataByKey(kv[0], ev.target.value)} value={kv[1]} placeholder={Voca.capitalize(kv[0])}></input>
            ))}
            <button onClick={() => setEditMetaData(false)}>Close</button>
        </div>
    )
}
