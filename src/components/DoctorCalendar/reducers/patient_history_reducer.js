import {
  FETCH_PATIENT_HISTORY_BY_APPOINTMENT,
  CREATE_PATIENT_HISTORY,
  EDIT_PATIENT_HISTORY
} from "../actions";

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case FETCH_PATIENT_HISTORY_BY_APPOINTMENT:
    case CREATE_PATIENT_HISTORY:
    case EDIT_PATIENT_HISTORY:
      return { ...state, ...payload };
    default:
      return state;
  }
};
