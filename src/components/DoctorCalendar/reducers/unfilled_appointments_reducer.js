import { FETCH_UNFILLED_APPOINTMENTS } from "../actions";

const INITIAL_STATE = [];

export default (state = INITIAL_STATE, { type, payload }) => {
	switch (type) {
		case FETCH_UNFILLED_APPOINTMENTS:
			return payload;
		default:
			return state;
	}
};
