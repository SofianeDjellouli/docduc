import React, { memo, Fragment } from "react";
import { isDoctor } from "../../utils";
import { ModalDevices, Tooltip } from "../";
import "./style.css";

const _ChatHeader = ({
	settingsOpened,
	toggleSettings,
	call,
	toggleBlock,
	toggleMute,
	ImageURL,
	Gender,
	name,
	online,
	Muted,
	Blocked,
	ID
}) => {
	return (
		<div className="chat-header">
			{ID && (
				<Fragment>
					<div className="chat-header-content">
						<img
							src={ImageURL}
							width="40"
							height="40"
							alt={name}
							className="chat-image chat-header-image"
						/>
						<div className="chat-text-wrapper" style={{ width: "auto" }}>
							<div className="chat-header-name">{name}</div>
							<div className="chat-header-status">{online && "Online"}</div>
						</div>
					</div>
					<div className="chat-header-buttons">
						{isDoctor && (
							<Tooltip title="Video call">
								<img src="/img/video.png" height="25" alt="Video call" onClick={call} />
							</Tooltip>
						)}
						<Tooltip title={Muted ? "Unmute" : "Mute"}>
							<img
								src={`/img/${Muted ? "notifications" : "bell-01"}.png`}
								height="30"
								alt="Mute user"
								onClick={() => toggleMute(ID, !Muted)}
							/>
						</Tooltip>
						<Tooltip title={Blocked ? "Unblock" : "Block"}>
							<img
								src={`/img/block${Blocked ? "_active" : ""}-01.png`}
								height="30"
								alt="Block user"
								onClick={() => toggleBlock(ID, !Blocked)}
							/>
						</Tooltip>
						<Tooltip title="Media settings">
							<img
								onClick={toggleSettings}
								src="/img/gear-01.png"
								alt="Open settings"
								height="30"
							/>
						</Tooltip>
					</div>
				</Fragment>
			)}
			<ModalDevices open={settingsOpened} onClose={toggleSettings} />
		</div>
	);
};

export const ChatHeader = memo(_ChatHeader);
