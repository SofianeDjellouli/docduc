import { SWITCH_TO_VIDEO, SWITCH_TO_CHAT } from "../actions";

export default function(state = "chat", { type }) {
	switch (type) {
		case SWITCH_TO_VIDEO:
			return "video";
		case SWITCH_TO_CHAT:
			return "chat";
		default:
			return state;
	}
}
