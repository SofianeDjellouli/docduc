import loadingMessages from "./messages_loading_reducer";
import chats from "./chats_reducer";
import messages from "./messages_reducer";
import currentChat from "./current_chat_reducer";
import mode from "./mode_reducer";
import callData from "./call_data_reducer";

export default {
	pubnub: (state = {}) => state,
	loadingMessages,
	chats,
	messages,
	currentChat,
	mode,
	callData
};
