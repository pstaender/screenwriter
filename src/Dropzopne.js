import React from "react";
// Import the useDropzone hooks from react-dropzone
import { useDropzone } from "react-dropzone";

const Dropzone = ({ onDrop, accept }) => {
  // Initializing useDropzone hooks with options
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept
  });

  /* 
    useDropzone hooks exposes two functions called getRootProps and getInputProps
    and also exposes isDragActive boolean
  */

  return (
    <div className="dropzone-div" {...getRootProps()}>
      <input className="dropzone-input" {...getInputProps()} />
      <div className="dropzone-area icons">
        {isDragActive ? (
          <div className="dropzone-content">Release to drop the txt file here</div>
        ) : (
          <div className="dropzone-content icon">
            <i className="gg-add"></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropzone;
