import { ADD_MESSAGE, MESSAGES_LOADING, EDIT_MESSAGE, DELETE_MESSAGE, LOAD_MESSAGES } from "./";
import { chatRequest, getAuth, MINIMUM_MESSAGES, getLoginId } from "../../../utils";

export const getMessages = (ID, from = 0) => dispatch => {
  dispatch({ type: MESSAGES_LOADING, payload: from === 0 ? 1 : 2 });
  return chatRequest
    .get(`all-message/${ID}/${from}/${from + MINIMUM_MESSAGES}`, getAuth())
    .then(({ data }) => {
      dispatch({ type: LOAD_MESSAGES, payload: data.reverse(), meta: { ID, from } });
      var ids = [];
      for (let i = 0; i < data.length; i++)
        if (!data[i].is_read && data[i].creator_id !== getLoginId()) ids.push(data[i].ID);
      if (ids.length) chatRequest.post(`read_message/${ID}`, { ids }, getAuth());
    });
};

export const addMessage = payload => (dispatch, getState) => {
  const meta = getState().currentChat.ID,
    { conversation_id, ID, creator_id } = payload;
  if (meta === conversation_id) {
    payload.is_read = true;
    if (creator_id !== getLoginId())
      return chatRequest.post(`read_message/${conversation_id}`, { ids: [ID] }, getAuth());
  }
  dispatch({ type: ADD_MESSAGE, payload, meta });
};

export const changeMessage = payload => (dispatch, getState) =>
  dispatch({ type: EDIT_MESSAGE, payload, meta: getState().currentChat.ID });

export const removeMessage = payload => (dispatch, getState) => {
  const {
    currentChat: { ID },
    chats
  } = getState();
  for (let i = 0; i < chats.length; i++)
    if (chats[i].LastMessageContent.ID === payload.ID)
      return chatRequest
        .get(`all-message/${chats[i].ID}/0/1`, getAuth())
        .then(({ data: [LastMessageContent] = {} }) =>
          dispatch({ type: DELETE_MESSAGE, payload, meta: { ID, LastMessageContent } })
        );
  dispatch({ type: DELETE_MESSAGE, payload, meta: { ID } });
};

export const sendMessage = ({ content, file, type }) => (dispatch, getState) => {
  const {
    currentChat: { ID, login_id },
    pubnub: { publish }
  } = getState();
  return chatRequest
    .post(
      `send-message/${ID}`,
      { ...(content && { content }), ...(file && { file }), ...(type && { type }) },
      getAuth()
    )
    .then(({ data }) => [login_id, getLoginId()].forEach(e => publish("new-message", e, { data })));
};

export const editMessage = (id, content) => (dispatch, getState) => {
  const {
    currentChat: { ID, login_id },
    pubnub: { publish }
  } = getState();
  return chatRequest
    .post(`edit-message/${ID}/${id}`, { content }, getAuth())
    .then(({ data }) =>
      [login_id, getLoginId()].forEach(e => publish("edit-message", e, { data }))
    );
};

export const deleteMessage = id => (dispatch, getState) => {
  const {
    currentChat: { ID, login_id },
    pubnub: { publish }
  } = getState();
  return chatRequest
    .delete(`delete-message/${ID}/${id}`, getAuth())
    .then(({ data }) =>
      [login_id, getLoginId()].forEach(e => publish("delete-message", e, { data }))
    );
};
