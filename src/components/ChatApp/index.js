import React, { PureComponent, Fragment } from "react";
import { Chats, ChatHeader, Conversation, EmptyChat, ErrorBoundary } from "../";
import { connect } from "react-redux";
import { Modal } from "@material-ui/core";
import {
  getChats,
  addChat,
  setCurrentChat,
  addMessage,
  toggleBlock,
  toggleMute,
  editMessage,
  switchToVideo,
  deleteMessage,
  sendMessage,
  call
} from "../Chat/actions";
import { MINIMUM_CHATS, EMPTY_MESSAGE, getLoginId, getName } from "../../utils";
import "./style.css";

class _ChatApp extends PureComponent {
  state = { chatsFilter: "", settingsOpened: false, ringing: false };

  componentDidMount() {
    const { chats, getChats, addListener } = this.props;
    if (getLoginId() && !chats.length)
      getChats().then(chats => {
        if (chats) {
          this.chatsList = document.querySelector(".chats-list");
          // this.chatsList.addEventListener("scroll", this.handleScroll);
        }
      });
    addListener(this.listener);
    this.handleIdle();
    ["mousemove", "keydown"].forEach(e => document.addEventListener(e, this.handleIdle));
  }

  componentWillUnmount() {
    this.props.removeListener(this.listener);
    if (this.chatsList) this.chatsList.removeEventListener("scroll", this.handleScroll);
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    ["mousemove", "keydown"].forEach(e => document.removeEventListener(e, this.handleIdle));
  }

  /*  componentDidUpdate = prevProps => {
    const { chats } = this.props;
    if (!prevProps.chats.length && chats.length) {
      this.chatsList = document.querySelector(".chats-list");
      this.chatsList.addEventListener("scroll", this.handleScroll);
    }
  };*/

  listener = {
    message: ({ message: { type, senderId, name, data: { conversation_id } = "" } }) => {
      const { chats, setSnackbar, currentChat, addChat, publish } = this.props,
        { ringing, message } = this.state;
      console.log(type);
      switch (type) {
        case "new-message":
          if (!chats.some(e => e.ID === conversation_id)) addChat(conversation_id);
          break;
        case "call":
          if (!ringing && !chats.some(e => e.login_id === senderId && e.Blocked))
            this.setState({ ringing: true, message: { senderId, name, conversation_id } });
          else if (ringing && message && message.senderId !== senderId)
            publish("call-busy", senderId);
          break;
        case "call-busy":
          setSnackbar({ message: `${currentChat.name} is busy.` });
          break;
        case "cancel-call":
        case "video-offer":
          if (ringing) this.setState({ ringing: false });
          break;
        default:
          break;
      }
    }
  };

  handleScroll = _ => {
    const {
        chats: { length },
        getChats
      } = this.props,
      { scrollTop, scrollHeight, clientHeight } = this.chatsList;
    if (scrollTop + clientHeight === scrollHeight && length >= MINIMUM_CHATS)
      getChats(Math.floor(length / MINIMUM_CHATS));
  };

  pickUp = () => {
    const {
        message: { senderId, name, conversation_id }
      } = this.state,
      { publish, switchToVideo } = this.props;
    publish("call-ok", senderId);
    switchToVideo({ senderId, name, conversation_id });
  };

  hangUp = () => {
    this.setState({ ringing: false });
    const { publish, sendMessage } = this.props;
    publish("call-stop", this.state.message.senderId);
    publish("cancel-call", getLoginId());
    sendMessage({ content: `${getName()} rejected the call.`, type: "rejected" });
  };

  handleIdle = () => {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    if (process.env.NODE_ENV === "production")
      this.refreshTimeout = setTimeout(() => window.location.reload(), 300000);
  };

  handleChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  toggleSettings = _ =>
    this.setState(({ settingsOpened }) => ({ settingsOpened: !settingsOpened }));

  render() {
    const {
      state: { chatsFilter, settingsOpened, ringing, message: { name } = "Your doctor" },
      props: { setCurrentChat, currentChat, chats, toggleMute, toggleBlock, call },
      handleChange,
      toggleSettings
    } = this;
    return (
      <main className="chat-app">
        {!chats.length ? (
          EmptyChat(EMPTY_MESSAGE)
        ) : (
          <Fragment>
            <Chats
              {...{
                handleChange,
                chatsFilter,
                setCurrentChat,
                ID: currentChat.ID,
                chats
              }}
            />
            <div className="chat-area">
              <ChatHeader
                {...{
                  settingsOpened,
                  toggleSettings,
                  call,
                  toggleBlock,
                  toggleMute,
                  ...currentChat
                }}
              />
              <ErrorBoundary>
                <Conversation height="calc(100vh - 264px)" />
              </ErrorBoundary>
            </div>
            {ringing && (
              <Modal open={ringing} className="ringing-popup-wrapper">
                <div className="popup" style={{ justifyContent: "space-around" }}>
                  <h3 className="popup-title">{`${name} is calling you.`}</h3>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <div className="call-popup-buttons-wrapper">
                      <img
                        onClick={this.pickUp}
                        src="/img/phoneicon.png"
                        alt="pick up"
                        height="70"
                      />
                      Accept
                    </div>
                    <div className="call-popup-buttons-wrapper">
                      <img
                        onClick={this.hangUp}
                        src="/img/phone-01.png"
                        alt="hang up"
                        height="70"
                      />
                      Reject
                    </div>
                  </div>
                </div>
              </Modal>
            )}
          </Fragment>
        )}
      </main>
    );
  }
}

export const ChatApp = connect(
  ({ currentChat, chats, pubnub: { addListener, removeListener, publish } }) => ({
    currentChat,
    chats,
    addListener,
    removeListener,
    publish
  }),
  {
    getChats,
    addChat,
    setCurrentChat,
    addMessage,
    toggleBlock,
    toggleMute,
    editMessage,
    switchToVideo,
    deleteMessage,
    sendMessage,
    call
  }
)(_ChatApp);
