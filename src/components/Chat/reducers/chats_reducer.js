import {
	GET_CHATS,
	LOAD_MESSAGES,
	ADD_CHAT,
	ADD_MESSAGE,
	MUTE_CHAT,
	UNMUTE_CHAT,
	BLOCK_CHAT,
	UNBLOCK_CHAT,
	EDIT_MESSAGE,
	DELETE_MESSAGE
} from "../actions";

export default function(state = [], { type, payload, meta }) {
	const currentState = [...state];
	switch (type) {
		case GET_CHATS:
			if (state.length) {
				var uniqueNewChats = [];
				for (let i = 0; i < payload.length; i++)
					for (let j = 0; j < state.length; j++) {
						if (payload[i].login_id === state[j].login_id) break;
						else if (j === state.length - 1) uniqueNewChats.push(payload[i]);
					}
				if (uniqueNewChats.length === 0) return state;
				else return state.concat(uniqueNewChats);
			} else return state.concat(payload);
		case LOAD_MESSAGES:
			if (meta.from === 0)
				for (let i = 0; i < currentState.length; i++)
					if (currentState[i].ID === meta.ID && !currentState[i].LastMessageContent.is_read) {
						currentState[i].LastMessageContent.is_read = true;
						return currentState;
					}
			break;
		case ADD_CHAT:
			return [payload, ...state];
		case ADD_MESSAGE:
			for (let i = 0; i < currentState.length; i++) {
				let currentChat = currentState[i];
				if (currentChat.ID === payload.conversation_id) {
					currentChat.LastMessageContent = payload;
					currentState.splice(i, 1);
					return [currentChat, ...currentState];
				}
			}
			break;
		case EDIT_MESSAGE:
			for (let i = 0; i < currentState.length; i++) {
				let currentChat = currentState[i];
				if (
					currentChat.ID === payload.conversation_id &&
					currentChat.LastMessageContent.ID === payload.ID
				) {
					currentChat.LastMessageContent = payload;
					return currentState;
				}
			}
			break;
		case DELETE_MESSAGE:
			for (let i = 0; i < currentState.length; i++) {
				let currentChat = currentState[i];
				if (
					currentChat.ID === payload.conversation_id &&
					currentChat.LastMessageContent.ID === payload.ID
				) {
					currentChat.LastMessageContent = meta.LastMessageContent;
					return currentState;
				}
			}
			break;
		case MUTE_CHAT:
		case UNMUTE_CHAT:
			for (let i = 0; i < currentState.length; i++) {
				let currentChat = currentState[i];
				if (currentChat.ID === payload.ID) {
					currentChat.Muted = payload.mute;
					return currentState;
				}
			}
			break;
		case BLOCK_CHAT:
		case UNBLOCK_CHAT:
			for (let i = 0; i < currentState.length; i++) {
				let currentChat = currentState[i];
				if (currentChat.ID === payload.ID) {
					currentChat.Blocked = payload.block;
					return currentState;
				}
			}
			break;
		default:
			return state;
	}
	return state;
}
