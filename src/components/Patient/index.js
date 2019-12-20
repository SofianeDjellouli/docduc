import React, { memo, Fragment } from "react";
import Lightbox from "react-image-lightbox";
import PatientHOC from "./PatientHOC";
import "react-image-lightbox/style.css";
import "./style.css";

const reactModalStyle = { overlay: { zIndex: 2000 } };

const _Patient = ({
  file_link,
  isOpen,
  photoIndex,
  onClickImage,
  onCloseRequest,
  onMoveNextRequest,
  onMovePrevRequest
}) =>
  file_link &&
  file_link.length > 0 && (
    <Fragment>
      <div className="title-modal">Attached files</div>
      <div className="patient__images">
        {file_link.map(({ link }, index) => (
          <button
            key={link}
            className="patient__image-button"
            type="button"
            onClick={() => onClickImage(index)}>
            <img src={link} alt={`Patient file ${index}`} className="patient__image" />
          </button>
        ))}
      </div>
      {isOpen && (
        <Lightbox
          {...{ reactModalStyle }}
          mainSrc={file_link[photoIndex].link}
          nextSrc={file_link[(photoIndex + 1) % file_link.length].link}
          prevSrc={file_link[(photoIndex + file_link.length - 1) % file_link.length].link}
          onCloseRequest={onCloseRequest}
          onMovePrevRequest={onMovePrevRequest}
          onMoveNextRequest={onMoveNextRequest}
        />
      )}
    </Fragment>
  );

export const Patient = memo(PatientHOC(_Patient));
