import React, { PureComponent, Fragment, createRef } from "react";
import { get } from "axios";
import {
	Modal,
	Menu,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	Button
} from "@material-ui/core";
import Linkify from "linkifyjs/react";
import { getTop, BUBBLER_CLASS_NAME, BUBBLER_COVER_CLASS_NAME, isDoctor } from "../../utils";

export class Message extends PureComponent {
	state = {
		poper: false,
		edit: false,
		messageToEdit: this.props.content || "",
		anchorEl: null,
		dialog: false
	};

	messageRef = createRef();

	handleClick = ({ currentTarget }) => this.setState({ anchorEl: currentTarget });

	handleClose = () => this.setState({ anchorEl: null, poper: false });

	openDelete = _ => this.setState({ dialog: true, anchorEl: null, poper: false });

	closeDialog = _ => this.setState({ dialog: false });

	handleMouseLeave = _ =>
		this.setState(({ anchorEl, edit, dialog }) => !dialog && !edit && { poper: Boolean(anchorEl) });

	handleMouseEnterAndOver = _ =>
		this.setState(({ poper, edit, dialog }) => !poper && !dialog && !edit && { poper: true });

	openEdit = _ => {
		const element = this.messageRef.current.closest(".message-wrapper"),
			wrapperTop = getTop(document.querySelector(".messages-area")),
			parentTop = getTop(element);
		this.setState({
			edit: true,
			poper: false,
			anchorEl: null,
			editMarginTop:
				parentTop > wrapperTop ? (element.clientHeight - 80) / 2 + parentTop : wrapperTop
		});
	};

	closeEdit = () => this.setState({ edit: false });

	editMessage = () => {
		const { messageToEdit } = this.state,
			{ editMessage, ID, content } = this.props;
		if (messageToEdit !== content && messageToEdit.length < 2000) {
			this.setState({ edit: false });
			editMessage(ID, messageToEdit);
		}
	};

	deleteMessage = _ => {
		this.closeDialog();
		const messageWrapper = this.messageRef.current.closest(".message-wrapper");
		messageWrapper.style.transform = `translateX(${messageWrapper.clientWidth + 20}px)`;
		const { deleteMessage, ID } = this.props;
		deleteMessage(ID);
	};

	handleEnter = e => {
		if (this.state.messageToEdit.length < 2000 && !e.shiftKey && e.key === "Enter") {
			e.preventDefault();
			this.editMessage();
		}
	};

	changeMessage = ({ target: { value } }) => this.setState({ messageToEdit: value });

	downloadFile = _ => {
		this.handleClose();
		const { file, file_name } = this.props;
		const download = data => {
			let link = document.createElement("a");
			link.download = file_name;
			link.href = data;
			document.body.appendChild(link); // Required for FF
			link.click();
			link.remove();
		};
		if (!file.startsWith("http")) download(file);
		else
			get(file, { responseType: "blob" }).then(({ data }) => {
				if (data instanceof Blob) {
					let reader = new FileReader();
					reader.readAsDataURL(data);
					reader.onloadend = () => download(reader.result);
				}
			});
	};

	render() {
		const { poper, edit, messageToEdit, editMarginTop, anchorEl, dialog } = this.state,
			tooLargeMessage = messageToEdit.length > 2000,
			open = Boolean(anchorEl),
			{ sent, content, file, file_name, time, isVideo, type, call } = this.props,
			fileType =
				file_name &&
				file_name
					.split(".")
					.pop()
					.toLowerCase(),
			isImage = fileType && fileType !== "pdf",
			isLink = file && file.startsWith("http"),
			cursor = isLink ? "pointer" : null,
			handleClickOnImg = isLink ? () => window.open(file) : null,
			videoSizes = isVideo ? 120 : 200,
			renderFile = (
				<div className="file-container">
					<div
						className="file-title"
						style={{ maxWidth: isImage ? 200 : 100, textAlign: "center" }}>
						{file_name}
					</div>
					<img
						onClick={handleClickOnImg}
						alt="file preview"
						src={isImage ? file : "/img/pdf.png"}
						height={!isImage ? "100" : null}
						style={{
							...(isImage
								? { maxHeight: videoSizes, maxWidth: videoSizes }
								: { margin: sent ? "0 6px 0 auto" : "0 0 0 6px" }),
							cursor
						}}
					/>
				</div>
			),
			timeAndPoper = (
				<div className={`message-time message-time-${sent ? "sent" : "received"}`}>
					{time}
					{!type && poper && (
						<div className="message-options" style={file ? { top: -35 } : null}>
							{sent ? (
								<Fragment>
									<i onClick={this.handleClick} className="material-icons">
										more_horiz
									</i>
									<Menu
										id="long-menu"
										open={open}
										onClose={this.handleClose}
										getContentAnchorEl={null}
										anchorEl={anchorEl}
										anchorOrigin={{ vertical: "bottom", horizontal: -45 }}>
										<MenuItem
											onClick={file ? this.downloadFile : this.openEdit}
											className="menu-item">
											{file ? "Download" : "Edit"}
										</MenuItem>
										<MenuItem
											onClick={this.openDelete}
											className="menu-item"
											style={{ color: "orangered" }}>
											Delete
										</MenuItem>
									</Menu>
								</Fragment>
							) : (
								file && (
									<i
										style={{ fontSize: 40 }}
										onClick={this.downloadFile}
										className="material-icons">
										cloud_download
									</i>
								)
							)}
						</div>
					)}
				</div>
			);
		return (
			<div
				className={`message-options-wrapper-${sent ? "sent" : "received"}`}
				onMouseEnter={sent || file ? this.handleMouseEnterAndOver : null}
				onMouseLeave={sent || file ? this.handleMouseLeave : null}
				onMouseOver={sent ? this.handleMouseEnterAndOver : null}
				ref={this.messageRef}>
				{sent && timeAndPoper}
				{file ? (
					renderFile
				) : (
					<Linkify
						tagName="div"
						options={{ attributes: { style: { wordBreak: "break-all" } } }}
						className={`message message-${type ? "status" : sent ? "sent" : "received"}`}>
						{content}
						{isDoctor && type && !isVideo && (
							<Fragment>
								<hr className="top-border" />
								<div onClick={call} className="call">
									Call again
								</div>
							</Fragment>
						)}
					</Linkify>
				)}
				{!sent && timeAndPoper}
				{edit && (
					<Modal open={edit} className="edit-message-wrapper" style={{ marginTop: editMarginTop }}>
						<div className="sending-area">
							<i onClick={this.closeEdit} className="material-icons edit-close">
								cancel
							</i>
							{tooLargeMessage && (
								<div className="message-warning" style={{ color: "#f5f6f7" }}>
									{`Your message is ${(messageToEdit.length - 2000).toLocaleString()} character${
										messageToEdit.length - 2000 > 1 ? "s" : ""
									} too long.`}
								</div>
							)}
							<textarea
								value={messageToEdit}
								onChange={this.changeMessage}
								onKeyPress={this.handleEnter}
								placeholder="Edit your message"
								className="message-box"
								autoFocus
							/>
							<div className="sending-area-buttons">
								<img
									src="/img/sendbutton-01.png"
									height="60"
									style={
										tooLargeMessage || (messageToEdit && !messageToEdit.length)
											? { cursor: "not-allowed" }
											: null
									}
									onClick={
										!tooLargeMessage && messageToEdit && messageToEdit.length
											? this.editMessage
											: null
									}
									alt="edit message"
								/>
							</div>
						</div>
					</Modal>
				)}
				{dialog && (
					<Dialog
						open={dialog}
						onClose={this.closeDialog}
						aria-labelledby="customized-dialog-title"
						classes={{ paper: "dialog" }}>
						<DialogTitle disableTypography id="customized-dialog-title" className="dialog-title">
							Delete message
							<IconButton
								onClick={this.closeDialog}
								children={<i className="material-icons">close</i>}
							/>
						</DialogTitle>
						<DialogContent style={{ fontSize: 14, paddingBottom: 0 }}>
							Are you sure you want to delete this message? This cannot be undone.
							<div className="message-to-delete message-wrapper">
								<div className="message-options-wrapper-sent" style={{ maxWidth: "80%" }}>
									<div className="message-time message-time-sent">{time}</div>
									{file ? (
										renderFile
									) : (
										<Fragment>
											<Linkify
												tagName="div"
												className="message message-sent"
												options={{
													attributes: { style: { wordBreak: "break-all" } }
												}}>
												{content}
											</Linkify>
											<div className="relative">
												<div className={BUBBLER_COVER_CLASS_NAME + "sent"} />
												<div className={BUBBLER_CLASS_NAME + "sent"} />
											</div>
										</Fragment>
									)}
								</div>
							</div>
						</DialogContent>
						<DialogActions>
							<Button onClick={this.closeDialog}>Cancel</Button>
							<Button color="primary" onClick={this.deleteMessage}>
								Delete
							</Button>
						</DialogActions>
					</Dialog>
				)}
			</div>
		);
	}
}
