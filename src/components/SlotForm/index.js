import React, { Fragment, useCallback, memo } from "react";
import { Button, ButtonGroup, Select, MenuItem } from "@material-ui/core";
import { TimePicker } from "@material-ui/pickers";
import SlotFormHOC from "./SlotFormHOC";
import { useToggle, handlePromise } from "../../utils";
import { Modal } from "../";
import "./style.css";

const _SlotForm = ({
  batch,
  deleteVisible,
  deleting,
  duration,
  endTime,
  event: { fullDate, start },
  isValidTime,
  loading,
  repID,
  slots,
  startTime,
  typeID,
  visible,
  onClose,
  onDelete,
  onSubmit,
  onToggleDelete,
  handleTime,
  handleButtonChange,
  handleDuration
}) => {
  const submitToggle = useToggle();
  const slotsNumber = typeID === 3 ? slots * 2 : slots;
  const s = slotsNumber > 1 ? "s" : "";
  const handleSubmit = useCallback(
    _ => handlePromise(onSubmit(), submitToggle.toggle).then(onClose),
    [submitToggle.toggle, onClose, onSubmit]
  );
  return (
    <Modal
      {...{ onClose }}
      open={Boolean(start)}
      title={`Slot${s} for ${fullDate}`}
      actions={
        <Button
          color="primary"
          disabled={!isValidTime || submitToggle.toggled}
          onClick={handleSubmit}>
          {submitToggle.toggled && <i className="fas fa-circle-notch fa-spin right" />} Add
        </Button>
      }>
      <div className="title-modal">Type</div>
      <ButtonGroup variant="contained">
        {[
          <Fragment>
            <i className="fas fa-user right" />
            In Person
          </Fragment>,
          <Fragment>
            <i className="fas fa-video right" />
            Video
          </Fragment>,
          "Both"
        ].map((e, i) => {
          const index = i + 1;
          return (
            <Button
              title="In person"
              color={typeID === index ? "primary" : "default"}
              name="typeID"
              data-i={index}
              key={index}
              onClick={handleButtonChange}>
              {e}
            </Button>
          );
        })}
      </ButtonGroup>
      <div className="title-modal">Start time</div>
      <TimePicker
        format="h:mm a"
        minutesStep={15}
        value={startTime}
        onChange={handleTime("startTime")}
      />
      <div className="title-modal">End time</div>
      <TimePicker
        format="h:mm a"
        minutesStep={15}
        value={endTime}
        onChange={handleTime("endTime")}
      />
      <div className="title-modal">{`Slot${s} duration`}</div>
      <Select value={duration} onChange={handleDuration}>
        {[15, 30, 45, 60, 120].map(e => (
          <MenuItem key={e} value={e} className="slot__menu-item">
            {`${e} min`}
          </MenuItem>
        ))}
      </Select>
      <div className="title-modal">Repeat</div>
      <ButtonGroup variant="contained">
        {["Once", "Weekly", "Daily"].map((e, i) => {
          const index = i + 1;
          return (
            <Button
              color={repID === index ? "primary" : "default"}
              name="repID"
              data-i={index}
              key={e}
              onClick={handleButtonChange}>
              {e}
            </Button>
          );
        })}
      </ButtonGroup>
      <div className="title-modal">Summary</div>
      <div className="slot__summary">
        <div className={`slot__interval${isValidTime ? "" : " slot__error"}`}>
          {`${startTime.format("LT")} to ${endTime.format("LT")}`}
        </div>
        <div className={`slot__interval${isValidTime ? "" : " slot__error"}`}>
          {`${slotsNumber}${
            repID === 2 ? " weekly" : repID === 3 ? " daily" : ""
          } slot${s} of ${duration} min${slotsNumber > 1 ? " each" : ""}`}
        </div>
      </div>
      {!isValidTime && (
        <div className="slot__error">
          Invalid range. Please reduce the duration or the number of slots.
        </div>
      )}
    </Modal>
  );
};

export const SlotForm = memo(SlotFormHOC(_SlotForm));
