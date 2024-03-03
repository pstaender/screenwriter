import { useEffect, useState } from "react";
import "./Toggle.scss";

export function Toggle({ onChange, defaultChecked, id, label } = {}) {

  return (
    <div className="toggle-switch">
      <input type="checkbox" id={id} onChange={onChange} defaultChecked={defaultChecked}/>
      <label htmlFor={id}>{label || "Toggle"}</label>
    </div>
  );
}
