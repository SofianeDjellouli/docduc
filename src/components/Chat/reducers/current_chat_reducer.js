import {
	SET_CURRENT_CHAT,
	GET_CHATS,
	MUTE_CHAT,
	UNMUTE_CHAT,
	BLOCK_CHAT,
	UNBLOCK_CHAT
} from "../actions";

export default function(state = {}, { type, payload, meta }) {
	switch (type) {
		case GET_CHATS:
			if (meta === 0 && payload.length) return payload[0];
			return state;
		case SET_CURRENT_CHAT:
			return payload;
		case BLOCK_CHAT:
		case UNBLOCK_CHAT:
			return { ...state, Blocked: payload.block };
		case MUTE_CHAT:
		case UNMUTE_CHAT:
			return { ...state, Muted: payload.mute };
		default:
			return state;
	}
}
