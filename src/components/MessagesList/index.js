import React, { memo } from "react";
import { Message } from "../";
import { BUBBLER_CLASS_NAME, BUBBLER_COVER_CLASS_NAME } from "../../utils";
import "./style.css";

const _MessagesList = ({
  messages,
  loadingMessages,
  height,
  loadingImages,
  topDate,
  editMessage,
  deleteMessage,
  isVideo,
  call
}) => (
  <div className="relative">
    <div className="messages-area scrollbar" style={{ height }}>
      {messages && messages.length > 0 && topDate && (
        <div className="top-date">
          <span>{topDate}</span>
        </div>
      )}
      {(loadingMessages || loadingImages) && (
        <div
          className="spinner-wrapper"
          style={{
            width: "calc(100% - 20px)",
            ...(!(loadingMessages === 1 || loadingImages) && { height: "auto" })
          }}>
          <img src="/img/Pacman-0.6s-80px.svg" width="80" height="80" alt="loading..." />
        </div>
      )}
      {messages &&
        messages.length > 0 &&
        messages.map(({ sent, content, file, file_name, time, ID, date, type }, i) => {
          const isNewDay = i === 0 || date !== messages[i - 1].date,
            noStatusNoFile = !type && !file;
          return (
            <div key={ID} className={`message-wrapper${isNewDay ? " top-border" : ""}`}>
              {isNewDay && (
                <div className="message-date">
                  <span>{date}</span>
                </div>
              )}
              {noStatusNoFile && !sent && (
                <div className="relative">
                  <div className={BUBBLER_COVER_CLASS_NAME + "received"} />
                  <div className={BUBBLER_CLASS_NAME + "received"} />
                </div>
              )}
              <Message
                {...{
                  sent,
                  content,
                  file,
                  file_name,
                  time,
                  editMessage,
                  deleteMessage,
                  ID,
                  isVideo,
                  type,
                  call
                }}
              />
              {noStatusNoFile && sent && (
                <div className="relative">
                  <div className={BUBBLER_COVER_CLASS_NAME + "sent"} />
                  <div className={BUBBLER_CLASS_NAME + "sent"} />
                </div>
              )}
            </div>
          );
        })}
    </div>
  </div>
);

export const MessagesList = memo(_MessagesList);
