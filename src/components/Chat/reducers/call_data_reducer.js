import { SWITCH_TO_VIDEO } from "../actions";

export default function(state = { senderId: null }, { type, payload }) {
	switch (type) {
		case SWITCH_TO_VIDEO:
			return { ...payload };
		default:
			return state;
	}
}
