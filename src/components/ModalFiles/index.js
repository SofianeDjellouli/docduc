import React, { memo, useCallback } from "react";
import { Button } from "@material-ui/core";
import { Modal } from "../";
import { useToggle, handlePromise } from "../../utils";
import "./style.css";

const _ModalFiles = ({ open, onClose, sendFile, files }) => {
  const toggleLoading = useToggle(),
    handleSend = useCallback(_ => handlePromise(sendFile(), toggleLoading.toggle).then(onClose), [
      sendFile,
      onClose,
      toggleLoading.toggle
    ]);
  return (
    <Modal
      title="Preview files"
      {...{ open, onClose }}
      actions={
        <Button color="primary" onClick={handleSend} disabled={toggleLoading.toggled}>
          {toggleLoading.toggled && <i className="fas fa-circle-notch fa-spin right" />} Send
        </Button>
      }>
      <div className="input-image-preview-grid">
        {files.length > 0 &&
          files.map(({ name, file }) => (
            <div className="input-image-preview-wrapper" key={name}>
              <div className="input-image-name">{name}</div>
              <img
                src={
                  name &&
                  name.split(".").slice(-1)[0] &&
                  name
                    .split(".")
                    .slice(-1)[0]
                    .toLowerCase() !== "pdf"
                    ? file
                    : "/img/pdf.png"
                }
                alt="file preview"
                className="input-image-preview"
              />
            </div>
          ))}
      </div>
    </Modal>
  );
};

export const ModalFiles = memo(_ModalFiles);
