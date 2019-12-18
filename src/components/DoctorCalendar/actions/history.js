import { baseAuthRequest, getAuth } from "../../../utils";
import {
  CREATE_PATIENT_HISTORY,
  EDIT_PATIENT_HISTORY,
  FETCH_PATIENT_HISTORY_BY_APPOINTMENT
} from "./";

export const getHistory = id => (dispatch, getState) =>
  getState().patientHistory[id] ||
  baseAuthRequest
    .get(`patient_history_by_appointment_id/${id}`, getAuth())
    .then(({ data }) =>
      dispatch({ type: FETCH_PATIENT_HISTORY_BY_APPOINTMENT, payload: { [id]: data } })
    );

export const createHistory = history => dispatch =>
  baseAuthRequest.post("patient_history", history, getAuth()).then(({ data }) =>
    dispatch({
      type: CREATE_PATIENT_HISTORY,
      payload: { [history.appointment_id]: parsePatientHistory(data) }
    })
  );

export const editHistory = history => dispatch =>
  baseAuthRequest.post("edit_patient_history", history, getAuth()).then(({ data }) =>
    dispatch({
      type: EDIT_PATIENT_HISTORY,
      payload: { [history.appointment_id]: parsePatientHistory(data) }
    })
  );

function parsePatientHistory(apptment) {
  const appointment = {};
  for (var key in apptment) {
    const newKey = key.replace(/_([a-z])/g, (m, w) => w.toUpperCase());
    appointment[newKey] = apptment[key];
  }
  return appointment;
}
