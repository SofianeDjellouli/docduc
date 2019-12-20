import { create } from "axios";
import { API, getAuth, getPracticeAuth } from "./";

export const request = ({ baseURL = "", ...config } = {}) =>
	create({ baseURL: `${API}${baseURL}`, timeout: 20000, ...config });

export const baseRequest = request();
export const searchRequest = request({ baseURL: "search/" });

export const authRequest = baseURL => request({ ...getAuth(), baseURL });

export const baseAuthRequest = authRequest();
export const chatRequest = authRequest("chat/");
export const adminProfileRequest = authRequest("admin/profile/");
export const adminAppointmentsRequest = authRequest("admin/appointments/");
export const appointmentsRequest = authRequest("appointment/");
export const bookingRequest = authRequest("booking/");
export const bookingPatientRequest = authRequest("booking/patient/");
export const careTeamRequest = authRequest("patients/favorites/");
export const patientsRequest = authRequest("patients/");
export const paymentRequest = authRequest("payment/");
export const doctorsBookingRequest = authRequest("doctors/booking/");

export const practiceRequest = request({ baseURL: "practice/", ...getPracticeAuth() });

export const uploadFile = (name, content) =>
	baseAuthRequest.post(`upload_file?name=${name}`, content);
