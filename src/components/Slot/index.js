import React, { Fragment, useCallback, memo, useState } from "react";
import { Button, ButtonGroup, Input, Slide } from "@material-ui/core";
import { useToggle, handlePromise } from "../../utils";
import { deleteAppointments } from "../DoctorCalendar/actions";
import { Modal, TooltipButton } from "../";
import { useDispatch } from "react-redux";
import "./style.css";

const _Slot = ({
  event: {
    id,
    duration = 15,
    statusDescription,
    start,
    slots,
    typeID,
    fullDate,
    fullTime,
    startHour,
    endHour,
    isFuture
  } = {},
  onClose,
  setSnackbar
}) => {
  const [batch, setBatch] = useState(0);
  const handleButtonChange = useCallback(
    ({ currentTarget: { name, dataset: { type } = {} } = {} }) => setBatch(parseInt(type)),
    []
  );
  const deleting = useToggle();
  const showDelete = useToggle();
  const dispatch = useDispatch();
  const handleDelete = useCallback(
    _ => {
      if (statusDescription === "PendingToPay")
        setSnackbar({ message: "This slot is being reserved by a patient." });
      else
        handlePromise(
          dispatch(deleteAppointments({ batch, id })).then(length =>
            setSnackbar({
              type: 0,
              message: `You deleted ${length === 1 ? "one" : length} slot${length > 1 ? "s" : ""}.`
            })
          ),
          deleting.toggle
        );
    },
    [id, statusDescription, dispatch, batch, deleting.toggle, setSnackbar]
  );
  return (
    <Modal
      noClose
      {...{ onClose }}
      open={!!start}
      title={`Slot for ${fullDate}`}
      actions={
        isFuture && (
          <Fragment>
            <div className="slide-buttons">
              <Slide direction="left" in={showDelete.toggled}>
                <ButtonGroup variant="contained">
                  {[
                    { label: "This event", title: "This event", type: 0 },
                    { label: "Same time events", title: "This and following events", type: 2 },
                    { label: "All events", title: "All events created at the same time", type: 1 }
                  ].map(({ label, title, type }) => (
                    <TooltipButton
                      key={label}
                      {...{ title }}
                      name="batch"
                      data-type={type}
                      color={type === batch ? "primary" : "default"}
                      onClick={handleButtonChange}>
                      {label}
                    </TooltipButton>
                  ))}
                </ButtonGroup>
              </Slide>
            </div>
            <Button color="secondary" onClick={onClose}>
              Cancel
            </Button>
            {showDelete.toggled ? (
              <Button color="primary" disabled={deleting.toggled} onClick={handleDelete}>
                {deleting.toggled && <i className="fas fa-circle-notch fa-spin right" />} Confirm
              </Button>
            ) : (
              <Button color="primary" onClick={showDelete.toggle}>
                Delete
              </Button>
            )}
          </Fragment>
        )
      }>
      <div className="title-modal">Type</div>
      <ButtonGroup disableRipple variant="contained">
        {[
          <Fragment>
            <i className="fas fa-user right" />
            In Person
          </Fragment>,
          <Fragment>
            <i className="fas fa-video right" />
            Video
          </Fragment>
        ].map((e, i) => (
          <Button color={typeID === i + 1 ? "primary" : "default"} key={i}>
            {e}
          </Button>
        ))}
      </ButtonGroup>
      <div className="title-modal">Start time</div>
      <Input disabled value={startHour} />
      <div className="title-modal">End time</div>
      <Input disabled value={endHour} />
      <div className="title-modal">Duration</div>
      <Input disabled value={`${duration} min`} />
      <div className="title-modal">Summary</div>
      <div className="slot__summary">
        <div className="slot__interval">{fullTime}</div>
        <div className="slot__interval">{`1 ${
          typeID === 1 ? "in person" : "video"
        } slot of ${duration} min`}</div>
      </div>
    </Modal>
  );
};

export const Slot = memo(_Slot);
