import { doctorsBookingRequest, getAuth } from "../../../utils";
import { ADD_SERVICE, FETCH_SERVICES } from "./";

export const fetchServices = id => (dispatch, getState) =>
  getState().services[id] ||
  doctorsBookingRequest
    .get(`get_services/${id}`, getAuth())
    .then(({ data }) => dispatch({ type: FETCH_SERVICES, payload: data, meta: id }));

export const addServices = (services, appointment_id) => dispatch =>
  doctorsBookingRequest
    .post(
      "add_services",
      {
        appointment_id,
        services: services.map(
          ({
            price,
            payment_type,
            insurance_type,
            appointment_id,
            service_id,
            diagnoses,
            ...service
          }) => ({
            ...service,
            diagnoses: diagnoses.map(({ id, ...e }) => ({ ...(id && { id: parseInt(id) }), ...e })),
            ...(service_id && { service_id: parseInt(service_id) }),
            ...(payment_type === "3"
              ? { price: 0 }
              : {
                  price: parseInt(price),
                  payment_type: parseInt(payment_type),
                  insurance_type: parseInt(insurance_type)
                })
          })
        )
      },
      getAuth()
    )
    .then(({ data }) =>
      dispatch({
        type: ADD_SERVICE,
        payload: data.map(
          ({
            appointment_id,
            service_description,
            price,
            payment_type,
            insurance_type,
            status,
            service_сode,
            diagnoses
          }) => ({
            appointment_id,
            service_description,
            price,
            payment_type,
            insurance_type,
            status,
            service_сode,
            diagnoses: diagnoses.map(({ description, code }) => ({ description, code }))
          })
        )
      })
    );
