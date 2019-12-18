import { ADD_SERVICE, FETCH_SERVICES } from "../actions";

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, { type, payload, meta }) => {
	switch (type) {
		case FETCH_SERVICES:
			return { ...state, [meta]: [...payload] };
		case ADD_SERVICE:
			return {
				...state,
				[payload[0].appointment_id]: [...(state[payload[0].appointment_id] || []), ...payload]
			};
		default:
			return state;
	}
};
