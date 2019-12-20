import { LOAD_MESSAGES, ADD_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE } from "../actions";
import { getLoginId } from "../../../utils";

const parseMessage = ({
	ID,
	CreatedAt,
	conversation_id,
	content,
	file,
	file_name,
	is_read,
	creator_id,
	type,
	author_first_name,
	author_last_name
}) => {
	const timeAndDate = parameters => new Date(CreatedAt).toLocaleString("en-US", parameters),
		sent = getLoginId() === creator_id;
	if (type === "rejected" && sent) content = "You rejected the call.";
	else if (type && !sent) {
		let doctor = `Dr. ${author_first_name} ${author_last_name}`;
		switch (type) {
			case "success":
				content = `${doctor} called you.`;
				break;
			case "cancelled":
				content = `${doctor} cancelled the call.`;
				break;
			case "timeout":
				content = "You didn't pick up.";
				break;
			default:
				break;
		}
	}
	return {
		is_read,
		ID,
		conversation_id,
		creator_id,
		sent,
		...(content && { content }),
		...(file && { file }),
		...(file_name && { file_name }),
		...(type && { type }),
		date: timeAndDate({ weekday: "long", month: "long", day: "numeric" }),
		time: timeAndDate({ hour: "numeric", minute: "numeric", hour12: true })
	};
};

export default function(state = [], { type, payload, meta }) {
	const currentState = [...state];
	switch (type) {
		case LOAD_MESSAGES:
			if (!state.length || state[0].conversation_id !== meta.ID) return payload.map(parseMessage);
			else return payload.map(parseMessage).concat(state);
		case ADD_MESSAGE:
			if (payload.conversation_id === meta) return state.concat(parseMessage(payload));
			break;
		case EDIT_MESSAGE:
			if (payload.conversation_id === meta)
				for (let i = 0; i < state.length; i++)
					if (state[i].ID === payload.ID) {
						currentState[i] = parseMessage(payload);
						return currentState;
					}
			break;
		case DELETE_MESSAGE:
			if (payload.conversation_id === meta.ID)
				for (let i = 0; i < state.length; i++)
					if (state[i].ID === payload.ID) {
						currentState.splice(i, 1);
						return currentState;
					}
			break;
		default:
			return state;
	}
	return state;
}
