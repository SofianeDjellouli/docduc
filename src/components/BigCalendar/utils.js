import moment from "moment";
import { momentLocalizer, Views } from "react-big-calendar";
import { now } from "../../utils";

const { WEEK, AGENDA, MONTH } = Views;
export const defaultView = WEEK;
export const views = [MONTH, WEEK, AGENDA];
export const localizer = momentLocalizer(moment);
export const dayPropGetter = date => {
	if (date > now) return { style: { cursor: "pointer" } };
};
export const eventPropGetter = ({ opacity, className }) => ({ className, style: { opacity } });
