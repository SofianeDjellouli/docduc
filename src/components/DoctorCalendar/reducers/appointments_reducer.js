import {
  CREATE_PATIENT_HISTORY,
  CREATE_APPOINTMENTS,
  DELETE_APPOINTMENTS,
  FETCH_APPOINTMENTS,
  APPOINTMENT_CHECKED,
  GET_APPOINTMENT,
  CANCEL_APPOINTMENT
} from "../actions";

const INITIAL_STATE = {};

function setClassName(appointments) {
  let eventsAtSameTime = false;
  for (let i = 0; i < appointments.length; i++) {
    const { start, end, id, typeID, statusCode, statusDescription, duration } = appointments[i],
      type = typeID === 1 ? "person" : "video",
      status = (statusDescription || "available").toLowerCase(),
      booked = status === "booked";
    for (let j = 0; j < appointments.length; j++) {
      const appointment = appointments[j];
      if (id !== appointment.id && start < appointment.end && end > appointment.start) {
        eventsAtSameTime = true;
        break;
      }
    }
    appointments[i].className = `${booked ? `rbc-event__${type} ` : ""}${
      statusCode === 3 ? "canceled" : status
    } rbc-event--left${booked || !(type === "video" && eventsAtSameTime) ? "0" : "50"}-width${
      !eventsAtSameTime || booked ? "100" : "50"
    }${duration === 15 ? " fifteen" : ""}`;
    eventsAtSameTime = false;
  }
  return appointments;
}

export default (state = INITIAL_STATE, { type, payload }) => {
  const range = Object.keys(state)[0];
  let appointments = state[range] && [...state[range]];
  switch (type) {
    case FETCH_APPOINTMENTS:
    case CREATE_APPOINTMENTS:
    case DELETE_APPOINTMENTS:
      return { [Object.keys(payload)[0]]: setClassName(Object.values(payload)[0]) };
    case CREATE_PATIENT_HISTORY: {
      const appointments = {};
      let patientHistory = {};
      for (var i in payload) patientHistory = payload[i];
      for (var key in state) {
        const appointment = state[key].filter(({ id }) => id === patientHistory.appointmentId)[0];
        appointments[key] = [...state[key]];
        if (appointment) {
          const ids = state[key].map(({ id }) => id);
          const idKey = ids.indexOf(appointment.id);
          appointments[key][idKey].isHistoryWritten = true;
        }
      }
      return appointments;
    }
    case APPOINTMENT_CHECKED:
      for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].id === payload) {
          appointments[i].isNotChecked = false;
          break;
        }
      }
      return { [range]: appointments };
    case GET_APPOINTMENT:
      for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].id === payload.id) {
          appointments[i] = { ...appointments[i], ...payload };
          break;
        }
      }
      return { [range]: appointments };
    case CANCEL_APPOINTMENT:
      const { appointmentID, reason } = payload;
      for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].id === appointmentID) {
          appointments[i] = { ...appointments[i], statusCode: 3, isNotChecked: false, reason };
          break;
        }
      }
      return { [range]: setClassName(appointments) };
    default:
      return state;
  }
};
