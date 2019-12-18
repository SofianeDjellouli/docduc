import React, { memo } from "react";
import "./style.css";

const _Input = ({ message, handleChangeMessage, handleEnter, sendMessage, getFiles }) => {
  const tooLargeMessage = message.length > 2000;
  return (
    <div className="sending-area">
      <textarea
        className="message-box"
        value={message}
        onChange={handleChangeMessage}
        placeholder="Type a message here..."
        onKeyDown={handleEnter}
        onDrop={getFiles}
        autoFocus
      />
      <div className="sending-area-buttons">
        <label htmlFor="upload">
          <img src="/img/clip-01.png" height="40" alt="file" />
        </label>
        <input
          type="file"
          onChange={getFiles}
          style={{ display: "none" }}
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          multiple="multiple"
          id="upload"
        />
      </div>
      <div className="sending-area-buttons">
        <img
          src="/img/sendbutton-01.png"
          height="60"
          style={tooLargeMessage ? { cursor: "not-allowed" } : null}
          onClick={tooLargeMessage ? null : sendMessage}
          alt="send"
        />
      </div>
      {tooLargeMessage && (
        <div className="message-warning">
          {`Your message is ${(message.length - 2000).toLocaleString()}
             character${message.length - 2000 > 1 ? "s " : ""}
            too long.`}
        </div>
      )}
    </div>
  );
};

export const Input = memo(_Input);
