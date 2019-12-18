import { getAuth, getName, getLoginId, chatRequest } from "../../../utils";
import { SWITCH_TO_VIDEO, SWITCH_TO_CHAT } from "./";

export const switchToChat = _ => dispatch => dispatch({ type: SWITCH_TO_CHAT });

export const switchToVideo = payload => dispatch => dispatch({ type: SWITCH_TO_VIDEO, payload });

export const call = _ => (dispatch, getState) => {
	const {
		currentChat: { ID, login_id, Blocked, name },
		pubnub: { publish }
	} = getState();
	if (Blocked) Promise.reject(`You blocked ${name}. Please unblock him first.`);
	else
		return chatRequest
			.post(
				"video_chat/start_call",
				{
					conversation_id: ID,
					device_id: ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
						(c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
					)
				},
				getAuth()
			)
			.then(_ => {
				switchToVideo({ senderId: login_id, name, conversation_id: ID })(dispatch);
				publish("call", login_id, { name: getName(), senderId: getLoginId(), conversation_id: ID });
			});
};
