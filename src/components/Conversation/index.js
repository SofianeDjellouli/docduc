import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
	getMessages,
	editMessage,
	changeMessage,
	deleteMessage,
	removeMessage,
	sendMessage,
	addMessage,
	call
} from "../Chat/actions";
import { MessagesList, Input, ModalFiles } from "../";
import { getTop, MINIMUM_MESSAGES, uploadFile, handleFile } from "../../utils";
import "./style.css";

class _Conversation extends PureComponent {
	state = { loadingImages: false, message: "", files: [] };

	componentDidMount() {
		this.messageArea = document.querySelector(".messages-area");
		this.messageArea.addEventListener("scroll", this.handleScroll);
		this.scrollDown();
		this.props.addListener(this.listener);
	}

	componentDidUpdate(prevProps, { topDate }) {
		// we scroll down when messages loaded the first time, for every new message,
		// after images load, for a new user and when going to video
		// condition for scrolling when going to video is bad
		const { messages } = this.props,
			prevMessages = prevProps.messages,
			isNewMessage = messages.length - prevMessages.length === 1,
			{ scrollHeight, clientHeight, scrollTop } = this.messageArea;
		if (
			messages.length &&
			(!prevMessages.length ||
				(prevMessages.length && prevMessages[0].conversation_id !== messages[0].conversation_id) ||
				(isNewMessage && scrollHeight < scrollTop + clientHeight + 1000) ||
				(this.state.topDate && !topDate))
		) {
			this.scrollDown();
			const chatImages = [...document.querySelectorAll(".file-container img")].filter(
				e => !e.complete && !e.naturalWidth && !e.naturalHeight
			);
			if (chatImages.length) {
				this.setState({ loadingImages: true });
				let loadedImages = 0;
				const handleImagesLoading = () => {
					loadedImages++;
					this.scrollDown();
					if (loadedImages === chatImages.length) {
						this.setState({ loadingImages: false });
						chatImages.forEach(img => img.removeEventListener("load", handleImagesLoading));
					}
				};
				chatImages.forEach(img => img.addEventListener("load", handleImagesLoading));
			}
		}
	}

	listener = {
		message: ({ message: { data, type } }) => {
			const { addMessage, changeMessage, removeMessage } = this.props;
			switch (type) {
				case "new-message":
					addMessage(data);
					break;
				case "edit-message":
					changeMessage(data);
					break;
				case "delete-message":
					removeMessage(data);
					break;
				default:
					break;
			}
		}
	};

	componentWillUnmount() {
		this.messageArea.removeEventListener("scroll", this.handleScroll);
		this.props.removeListener(this.listener);
	}

	handleScroll = () => {
		const { messages } = this.props;
		if (this.setTopDate() && this.setTopDate() !== this.state.topDate)
			this.setState({ topDate: this.setTopDate() });
		if (this.messageArea.scrollTop === 0 && messages && messages.length >= MINIMUM_MESSAGES) {
			const {
					getMessages,
					currentChat: { ID }
				} = this.props,
				{ scrollHeight } = this.messageArea;
			getMessages(ID, messages.length).then(
				() => (this.messageArea.scrollTop = this.messageArea.scrollHeight - scrollHeight)
			);
		}
	};

	setTopDate = () => {
		const result = [...document.querySelectorAll(".message-date")]
			.filter(e => getTop(e) - getTop(this.messageArea) < 0)
			.pop();
		return result && result.firstChild && result.firstChild.innerText;
	};

	scrollDown = () => (this.messageArea.scrollTop = this.messageArea.scrollHeight);

	sendMessage = () => {
		const { message } = this.state;
		if (message && !this.hasBlock()) {
			this.props.sendMessage({ content: message });
			this.setState({ message: "" });
		}
	};

	hasBlock = () => {
		const {
			setSnackbar,
			currentChat: { Blocked, name }
		} = this.props;
		if (Blocked) setSnackbar({ message: `You blocked ${name}. Please unblock him first.` });
		return Blocked;
	};

	getFiles = e => handleFile(e).then(files => this.setState({ files }));

	sendFile = _ =>
		Promise.all(
			this.state.files.map(({ name, file }) =>
				uploadFile(name, file.split(",")[1]).then(({ data: { file } }) =>
					this.props.sendMessage({ file })
				)
			)
		);

	handleChangeMessage = ({ target: { value } }) => this.setState({ message: value });

	handleEnter = e => {
		if (this.state.message.length < 2001 && !e.shiftKey && e.key === "Enter") {
			e.preventDefault();
			this.sendMessage();
		}
	};

	clearFiles = () => this.setState({ files: [] });

	render() {
		const {
			props: { isVideo, messages, loadingMessages, deleteMessage, height, editMessage, call },
			state: { loadingImages, topDate, message, files },
			handleChangeMessage,
			handleEnter,
			sendMessage,
			clearFiles,
			sendFile,
			getFiles
		} = this;
		return (
			<div className="conversation">
				<MessagesList
					{...{
						isVideo,
						height,
						messages,
						loadingMessages,
						loadingImages,
						topDate,
						editMessage,
						deleteMessage,
						call
					}}
				/>
				<Input {...{ message, handleChangeMessage, handleEnter, sendMessage, getFiles }} />
				<ModalFiles open={!!files.length} onClose={clearFiles} {...{ files, sendFile }} />
			</div>
		);
	}
}
export const Conversation = connect(
	({
		messages,
		loadingMessages,
		currentChat,
		pubnub: { addListener, removeListener, publish },
		mode
	}) => ({
		messages,
		loadingMessages,
		currentChat,
		addListener,
		removeListener,
		publish,
		isVideo: mode === "video"
	}),
	{
		getMessages,
		editMessage,
		changeMessage,
		deleteMessage,
		removeMessage,
		sendMessage,
		addMessage,
		call
	}
)(_Conversation);
