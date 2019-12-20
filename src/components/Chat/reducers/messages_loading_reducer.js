import { LOAD_MESSAGES, MESSAGES_LOADING } from "../actions";

export default function(state = false, { type, payload }) {
	switch (type) {
		case MESSAGES_LOADING:
			return payload;
		case LOAD_MESSAGES:
			return false;
		default:
			return state;
	}
}
