import React, { Fragment, memo, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button, Input, Collapse, Chip, Grid } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Patient, Modal, Spinner, ServicesModal, Tooltip, Services } from "../";
import { useToggle, handlePromise, focusInputRef } from "../../utils";
import {
  createHistory,
  editHistory,
  getAppointment,
  fetchServices,
  getHistory,
  checkAppointment,
  cancelAppointment
} from "../DoctorCalendar/actions";
import "./style.css";

const _Appointment = ({
  event: {
    patientInfo: { symptoms = [], note, name, picture } = {},
    start,
    typeDescription,
    typeID,
    id,
    file_link,
    carrier,
    plan,
    group_number,
    member_policy_number,
    isHistoryWritten,
    fullTimeDate,
    isNotChecked,
    patientId,
    dob,
    isFuture
  },
  onClose,
  setSnackbar
}) => {
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const toggleServices = useToggle();
  const toggleNote = useToggle();
  const loading = useToggle();
  const toggleWriting = useToggle();
  const toggleReason = useToggle();
  const toggleCanceling = useToggle();
  const inputRef = useRef();
  const reasonRef = useRef();
  const dispatch = useDispatch();
  const { services = [] } = useSelector(({ services = {} }) => ({ services: services[id] }));
  const history = useSelector(({ patientHistory }) => {
    let history = patientHistory[id];
    return { comment: history ? history.comment : "", ID: history ? history.ID : "" };
  });
  const handleChange = useCallback(({ target: { value } }) => setComment(value), []);
  const handleReason = useCallback(({ target: { value } }) => setReason(value), []);
  const handleNote = useCallback(
    _ =>
      handlePromise(
        dispatch(
          (isHistoryWritten ? editHistory : createHistory)({
            appointment_id: id,
            ...(isHistoryWritten ? { ID: history.ID } : { patient_id: patientId }),
            comment
          })
        ).catch(_ => setComment(history.comment)),
        toggleWriting.toggle
      ).then(toggleNote.toggle),
    [
      comment,
      isHistoryWritten,
      history,
      dispatch,
      id,
      patientId,
      toggleWriting.toggle,
      toggleNote.toggle
    ]
  );
  const handleCancel = useCallback(
    _ =>
      reason
        ? handlePromise(
            dispatch(cancelAppointment({ appointmentID: id, reason }), toggleCanceling.toggle)
          ).then(onClose)
        : setSnackbar({ message: "Please write a reason." }),
    [id, reason, setSnackbar, toggleCanceling.toggle, dispatch, onClose]
  );

  useEffect(
    _ => {
      if (history.comment) setComment(history.comment);
    },
    [history.comment]
  );

  useEffect(
    _ => {
      handlePromise(
        Promise.all(
          [
            getAppointment(id),
            fetchServices(id),
            ...(isNotChecked ? [checkAppointment(id)] : []),
            ...(isHistoryWritten ? [getHistory(id)] : [])
          ].map(dispatch)
        ),
        loading.toggle
      );
    },
    [loading.toggle, id, isHistoryWritten, isNotChecked, dispatch]
  );

  useEffect(
    _ => {
      if (toggleNote.toggled) focusInputRef(inputRef);
    },
    [toggleNote.toggled]
  );

  useEffect(
    _ => {
      if (toggleReason.toggled) focusInputRef(reasonRef);
    },
    [toggleReason.toggled]
  );

  const commentInput = (
    <Fragment>
      <Input {...{ inputRef }} fullWidth multiline onChange={handleChange} value={comment} />
      <div className="handle-space">
        <Button color="secondary" onClick={toggleNote.toggle}>
          Cancel
        </Button>
        <Button disabled={toggleWriting.toggled} color="primary" onClick={handleNote}>
          {toggleWriting.toggled && <i className="fas fa-circle-notch fa-spin right" />}
          Confirm
        </Button>
      </div>
    </Fragment>
  );
  const insuranceData = useMemo(
    _ =>
      [
        { title: "Carrier", content: carrier },
        { title: "Plan", content: plan },
        { title: "Member policy number", content: member_policy_number },
        { title: "Group number", content: group_number }
      ].filter(e => !!e.content),
    [carrier, plan, member_policy_number, group_number]
  );
  return (
    <Modal
      className="appointment"
      title={
        <span>
          {`${typeDescription} appointment`}
          <br />
          {fullTimeDate}
        </span>
      }
      open={!!start}
      {...{ onClose }}>
      <div className="appointment__wrapper">
        {loading.toggled ? (
          Spinner(100)
        ) : (
          <Fragment>
            <div className="title-modal">Patient</div>
            <div className="patient__header">
              <img
                height="75"
                width="75"
                onClick={_ => window.open(picture)}
                alt={name}
                src={picture}
              />
              <span>{name}</span>
            </div>
            <div className="title-modal">DOB</div>
            <div>{dob}</div>
            <div className="title-modal">Insurance</div>
            <Grid container spacing={3}>
              {insuranceData.length > 0 ? (
                insuranceData.map(({ title, content }) => (
                  <Grid key={title} item xs={6}>
                    <div className="subtitle-modal">{title}</div>
                    {content}
                  </Grid>
                ))
              ) : (
                <Grid item>Pay out of pocket</Grid>
              )}
            </Grid>
            {note && (
              <Fragment>
                <div className="title-modal">Reason for visit</div>
                {note}
              </Fragment>
            )}
            <div className="title-modal">Symptoms</div>
            <div className="wrap">
              {symptoms.map(({ name }) => (
                <Chip color="primary" key={name} label={name} />
              ))}
            </div>
            <Patient {...{ file_link }} />
            <div className="title-modal doctors-note">
              Doctor's note
              <Tooltip type={0} title="The patient will be able to see this note">
                <i className="fas fa-info-circle left" />
              </Tooltip>
              {!toggleNote.toggled && (
                <Button color="primary" onClick={toggleNote.toggle}>
                  {isHistoryWritten ? "Edit" : "Add"}
                </Button>
              )}
            </div>
            {isHistoryWritten ? (
              !toggleNote.toggled ? (
                <div className="note">{comment}</div>
              ) : (
                commentInput
              )
            ) : (
              <Collapse in={toggleNote.toggled}>
                <div>{commentInput}</div>
              </Collapse>
            )}
            <div className="title-modal">
              Additional Procedures
              <Button color="primary" onClick={toggleServices.toggle}>
                Add
              </Button>
            </div>
            <Services {...{ services }} />
            {isFuture && (
              <Fragment>
                <Button color="primary" onClick={toggleReason.toggle}>
                  Cancel appointment
                </Button>
                <Collapse in={toggleReason.toggled}>
                  <div>
                    <Input
                      fullWidth
                      multiline
                      placeholder="Reason"
                      inputRef={reasonRef}
                      onChange={handleReason}
                      value={reason}
                    />
                    <div className="handle-space">
                      <Button color="secondary" onClick={toggleReason.toggle}>
                        Cancel
                      </Button>
                      <Button
                        disabled={toggleCanceling.toggled}
                        color="primary"
                        onClick={handleCancel}>
                        {toggleCanceling.toggled && (
                          <i className="fas fa-circle-notch fa-spin right" />
                        )}
                        Confirm
                      </Button>
                    </div>
                  </div>
                </Collapse>
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
      <ServicesModal open={toggleServices.toggled} onClose={toggleServices.toggle} {...{ id }} />
    </Modal>
  );
};

export const Appointment = memo(_Appointment);
