import moment from "moment";
import {
  getFullDate,
  now,
  appointmentsRequest,
  baseAuthRequest,
  bookingRequest,
  getAuth
} from "../../../utils";
import {
  CREATE_APPOINTMENTS,
  DELETE_APPOINTMENTS,
  FETCH_APPOINTMENTS,
  APPOINTMENT_CHECKED,
  GET_APPOINTMENT,
  CANCEL_APPOINTMENT
} from "./";

export const getAppointments = ({ from, to }) => (dispatch, getState) => {
  const { appointments } = getState();
  const index = `${from}_${to}`;
  return Promise.resolve(
    appointments[index] ||
      appointmentsRequest
        .get(`doctor?from_date=${from} 00:00&to_date=${to} 23:59`, getAuth())
        .then(({ data }) =>
          dispatch({ type: FETCH_APPOINTMENTS, payload: { [index]: parseAppointments(data) } })
        )
  );
};

export const getAppointment = id => (dispatch, getState) => {
  const appointments = Object.values(getState().appointments)[0];
  for (let i = 0; i < appointments.length; i++)
    if (appointments[i].id === id && appointments[i].gotInfo) return;
  return appointmentsRequest
    .get(`info/${id}`, getAuth())
    .then(
      ({
        data: {
          file_link,
          patient: {
            DOB,
            insurance_plan: { name, plan },
            insurance_info: { group_number, member_policy_number }
          }
        }
      }) =>
        dispatch({
          type: GET_APPOINTMENT,
          payload: {
            id,
            file_link,
            carrier: name,
            plan,
            group_number,
            member_policy_number,
            dob: new Date(DOB).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            }),
            gotInfo: true
          }
        })
    );
};

export const createAppointments = ({
  appointment: { startTime, endTime, duration, typeID, repID }
}) => (dispatch, getState) =>
  appointmentsRequest
    .post(
      "create",
      {
        start_time: moment.utc(moment(startTime)).format("YYYY-MM-DD HH:mm"),
        end_time: moment.utc(moment(endTime)).format("YYYY-MM-DD HH:mm"),
        rep_id: repID,
        duration,
        typeID
      },
      getAuth()
    )
    .then(({ data }) => {
      const { appointments } = getState();
      const newAppointments = parseAppointments(data);
      const apptms = {};
      for (var key in appointments) {
        const [startKey, endKey] = key.split("_");
        const startDate = moment(startKey).valueOf();
        const endDate = moment(endKey).valueOf();
        apptms[key] = [
          ...appointments[key],
          ...newAppointments.filter(({ start }) => {
            const startValue = moment(start).valueOf();
            return startValue >= startDate && startValue < endDate;
          })
        ];
      }
      dispatch({ type: CREATE_APPOINTMENTS, payload: apptms });
      return newAppointments.length;
    });

export const deleteAppointments = ({ batch, id }) => (dispatch, getState) =>
  appointmentsRequest.delete(`remove/${id}`, { data: { batch }, ...getAuth() }).then(({ data }) => {
    const { appointments } = getState();
    const appointmentIds = data.map(({ ID }) => ID);
    const apptms = {};
    for (var key in appointments)
      apptms[key] = appointments[key].filter(ap => !appointmentIds.includes(ap.id));
    dispatch({ type: DELETE_APPOINTMENTS, payload: apptms });
    return data.length;
  });

export const cancelAppointment = payload => dispatch =>
  bookingRequest
    .post("cancel", payload, getAuth())
    .then(_ => dispatch({ type: CANCEL_APPOINTMENT, payload }));

export const checkAppointment = appointment_id => dispatch =>
  baseAuthRequest
    .post("doctors/mark_booking_checked", { appointment_id }, getAuth())
    .then(_ => dispatch({ type: APPOINTMENT_CHECKED, payload: appointment_id }));

function parseAppointments(appointments) {
  return appointments.map(
    ({
      ID,
      endTime,
      patient_info,
      startTime,
      status_code,
      typeID,
      status_description,
      is_checked,
      ...appointment
    }) => {
      let patientInfo = undefined;
      if (patient_info) {
        const {
          note,
          symptoms,
          gender,
          first_name,
          image_url,
          last_name,
          patientID
        } = patient_info;
        patientInfo = {
          note,
          symptoms,
          id: patientID,
          name: `${first_name} ${last_name}`,
          picture: image_url || `/img/patient${gender}.svg`
        };
      }
      const appt = {};
      for (var key in appointment) {
        const newKey = key.replace(/_([a-z])/g, (m, w) => w.toUpperCase());
        appt[newKey] = appointment[key];
      }
      const start = new Date(startTime),
        end = new Date(endTime),
        opacity = moment(end).valueOf() < moment().valueOf() ? 0.8 : 1,
        momentStartFormat = a => moment(startTime).format(a),
        momentEndFormat = a => moment(endTime).format(a),
        fullDate = getFullDate(start),
        fullTime = `${momentStartFormat("LT")} - ${momentEndFormat("LT")}`;
      return {
        ...appt,
        id: ID,
        statusCode: status_code,
        fullTime,
        typeDescription: typeID === 1 ? "In person" : "Video",
        typeID,
        patientInfo,
        start,
        end,
        opacity,
        startHour: momentStartFormat("hh:mm"),
        endHour: momentEndFormat("hh:mm"),
        fullDate,
        fullTimeDate: `${fullDate}, ${fullTime}`,
        statusDescription: status_description,
        isNotChecked: status_description === "Booked" && !is_checked,
        isFuture: now < end
      };
    }
  );
}
