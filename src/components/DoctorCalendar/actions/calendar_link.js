import { baseAuthRequest, getAuth } from "../../../utils";
import { CALENDAR_LINK } from "./";

export const getCalendarLink = () => dispatch =>
	baseAuthRequest
		.get("get_calendar_link", getAuth())
		.then(({ data }) => dispatch({ type: CALENDAR_LINK, payload: data.link }));
