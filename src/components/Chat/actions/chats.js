import {
  GET_CHATS,
  SET_CURRENT_CHAT,
  MUTE_CHAT,
  UNMUTE_CHAT,
  BLOCK_CHAT,
  UNBLOCK_CHAT,
  ADD_CHAT,
  getMessages
} from "./";
import { chatRequest, getAuth, getLoginId, getName, MINIMUM_CHATS } from "../../../utils";

const parseChat = (
  {
    Blocked,
    FirstName,
    Gender,
    ID,
    ImageURL,
    LastMessageContent,
    LastName,
    Muted,
    login_id,
    user_type,
    specialty
  },
  i
) => ({
  Blocked,
  name: `${FirstName} ${LastName}`,
  ID,
  ImageURL: !ImageURL
    ? `/img/${user_type === 1 ? "doctor" : "patient"}${Gender.charAt(0).toUpperCase() +
        Gender.slice(1)}.svg`
    : ImageURL,
  LastMessageContent,
  Muted,
  login_id,
  specialty
});

export const getChats = (page = 0) => (dispatch, getState) =>
  chatRequest.get(`all-conversations/${page}/${MINIMUM_CHATS}`, getAuth()).then(({ data }) => {
    if (data.length) {
      let chats = data.map(parseChat),
        { hash, pathname } = window.location;
      if (hash)
        for (let i = 0; i < chats.length; i++) {
          const currentChat = { ...chats[i] },
            hashParams = hash.slice(1).split("/");
          if (currentChat.ID.toString() === hashParams[0]) {
            chats.splice(i, 1);
            chats = [currentChat, ...chats];
            if (hashParams[1] === "video")
              getState().pubnub.publish("call-push-received", currentChat.login_id, {
                senderId: getLoginId(),
                name: getName()
              });
            window.history.replaceState("", document.title, pathname);
            break;
          }
        }
      dispatch({ type: GET_CHATS, payload: chats, meta: page });
      if (page === 0) getMessages(chats[0].ID)(dispatch);
    }
    return data.length;
  });

export const addChat = ID => dispatch =>
  chatRequest
    .get(`conversation/${ID}`, getAuth())
    .then(({ data }) => dispatch({ type: ADD_CHAT, payload: parseChat(data) }));

export const setCurrentChat = payload => dispatch => {
  dispatch({ type: SET_CURRENT_CHAT, payload });
  if (payload && payload.ID) getMessages(payload.ID)(dispatch);
};

export const toggleBlock = (ID, block) => dispatch =>
  chatRequest
    .post(`block_conversation/${ID}`, { block }, getAuth())
    .then(({ data: { status, block } }) => {
      if (status === "Success")
        dispatch({ type: block ? BLOCK_CHAT : UNBLOCK_CHAT, payload: { ID, block } });
    });

export const toggleMute = (ID, mute) => dispatch =>
  chatRequest
    .post(`mute_conversation/${ID}`, { mute }, getAuth())
    .then(({ data: { status, mute } }) => {
      if (status === "Success")
        dispatch({ type: mute ? MUTE_CHAT : UNMUTE_CHAT, payload: { ID, mute } });
    });
