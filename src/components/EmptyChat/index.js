import React from "react";
import "./style.css";

export const EmptyChat = message => (
	<div className="empty-chat">
		<div>{message}</div>
		<img src="/img/Chat_List_Empty.png" width="275" alt="chat list empty" />
	</div>
);
