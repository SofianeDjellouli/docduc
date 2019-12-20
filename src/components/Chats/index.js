import React, { memo } from "react";
import { getLoginId } from "../../utils";
import "./style.css";

const _Chats = ({ handleChange, chatsFilter, setCurrentChat, ID, chats }) => (
  <div className="chats">
    <div className="chat-search">
      <div className="chat-search-icon">
        <img src="/img/search.png" alt="" width="30" style={{ margin: "0 auto" }} />
      </div>
      <input placeholder="Search" value={chatsFilter} name="chatsFilter" onChange={handleChange} />
    </div>
    <div className="chats-list scrollbar">
      {chats.length > 0 &&
        chats
          .filter(e => new RegExp(chatsFilter, "i").test(e.name))
          .map((e, i) => {
            const isCurrent = e.ID === ID,
              { LastMessageContent: { creator_id, is_read, content, file_name } = {} } = e;
            return (
              <div
                key={e.login_id}
                className={`chat-wrapper${isCurrent ? "-user" : ""}`}
                onClick={isCurrent ? null : () => setCurrentChat(e)}>
                <div className="chat-content">
                  <img
                    src={e.ImageURL}
                    width="75"
                    height="75"
                    alt=""
                    className="chat-image"
                    style={isCurrent ? { border: "1px solid white" } : null}
                  />
                  <div className="chat-text-wrapper">
                    <div className="chat-name-wrapper">
                      <div className="chat-name">{e.name}</div>
                      {!isCurrent && !is_read && creator_id !== getLoginId() && (
                        <div className="chat-unread" />
                      )}
                    </div>
                    <div className="chat-specialty">{e.specialty}</div>
                    <div className="chat-last-message">{content || file_name}</div>
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  </div>
);

export const Chats = memo(_Chats);
