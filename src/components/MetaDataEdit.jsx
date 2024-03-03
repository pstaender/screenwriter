import { useEffect } from "react";
import "./MetaDataEdit.scss";
import Voca from "voca";

const DEFAULT_META_DATA = {
  title: "",
  author: "",
  description: ""
};

export function MetaDataEdit({ metaData, setMetaData, setEditMetaData } = {}) {
  function setMetaDataByKey(key, value) {
    let data = {};
    data[key] = value;
    setMetaData({ ...metaData, ...data });
  }

  useEffect(() => {
    if (!metaData || Object.keys(metaData).length === 0) {
      setMetaData(DEFAULT_META_DATA);
    }
  }, [metaData]);

  function handleAddField(ev) {
    let fieldName = null;
    if (window.__TAURI__) {
      let i = 1;
      fieldName = `field1`;
      while (metaData[fieldName] !== undefined) {
        i++;
        fieldName = `field${i}`;
      }
    } else {
      fieldName = prompt(
        "Name of the field (lower case, letters and _ only please)",
        "copyright"
      );
      fieldName = fieldName?.replace(/[^a-zA-Z\_]+/g, "")?.toLocaleLowerCase();
    }
    if (fieldName) {
      let d = metaData;
      d[fieldName] = "";
      setMetaData({ ...d });
    }
  }

  function handleClearFields() {
    let d = {};
    for (let k in metaData) {
      if (!metaData[k]?.trim()) {
        continue;
      }
      d[k] = metaData[k];
    }
    setMetaData({ ...DEFAULT_META_DATA, ...d });
  }

  return (
    <div className="edit-meta-data">
      <div className="window">
        {metaData &&
          Object.entries({ ...DEFAULT_META_DATA, ...metaData }).map((kv) => (
            <textarea
              key={`metadata_${kv[0]}`}
              onChange={(ev) => setMetaDataByKey(kv[0], ev.target.value)}
              value={kv[1]}
              placeholder={Voca.capitalize(kv[0])}
            ></textarea>
          ))}
        <div className="icon">
          <div>
            <i className="gg-trash" onClick={handleClearFields}></i>
          </div>
          <div onClick={handleAddField}>
            <i className="gg-add-r"></i>
          </div>
        </div>
        <div className="icon">
          <button onClick={() => setEditMetaData(false)}>Close</button>
        </div>
      </div>
    </div>
  );
}
