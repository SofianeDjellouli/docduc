import React, { Component } from "react";
import { connect } from "react-redux";
import { isDoctor, getLoginId, getName } from "../../utils";
import { ModalDevices, Spinner, Conversation } from "../";
import { sendMessage, setCurrentChat, switchToChat } from "../Chat/actions";
import "./style.css";

class _VideoApp extends Component {
	constructor(props) {
		super(props);
		const { REACT_APP_TURN_CREDENTIAL, REACT_APP_TURN_USER_NAME } = process.env,
			iceCreds = { username: REACT_APP_TURN_USER_NAME, credential: REACT_APP_TURN_CREDENTIAL };
		this.peerConnection = new RTCPeerConnection({
			sdpSemantics: "unified-plan",
			iceServers: [
				{ urls: "turn:s3.xirsys.com:3478?transport=udp", ...iceCreds },
				{ urls: "turn:s3.xirsys.com:80?transport=tcp", ...iceCreds },
				{ urls: "stun:s3.xirsys.com" }
			]
		});
		this.peerConnection.onicecandidate = this.handleIceCandidate;
		this.peerConnection.ontrack = this.handleAddTrackAndStream;
		this.peerConnection.onaddstream = this.handleAddTrackAndStream;
		this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionsStateChange;
		this.state = {
			loadingRemoteVideo: true,
			loadingLocalVideo: true,
			mainRemote: true,
			showMessages: false,
			video: true,
			audio: true,
			ModalDevicesOpened: false
		};
	}

	componentDidMount() {
		this.mounted = true;
		const {
			chats,
			setCurrentChat,
			currentChat: { login_id },
			callData: { senderId },
			addListener
		} = this.props;
		if (senderId !== login_id)
			for (let i = 0; i < chats.length; i++)
				if (chats[i].login_id === senderId) {
					setCurrentChat(chats[i]);
					break;
				}
		addListener(this.listener);
		window.addEventListener("beforeunload", this.stopCall);
		this.handleMedia();
		navigator.mediaDevices.ondevicechange = _ => this.handleMedia(true);
		this.callingTimeout = setTimeout(this.stopCallAndStream, 60000);
	}

	componentWillUnmount() {
		this.mounted = false;
		window.removeEventListener("beforeunload", this.stopCall);
		this.props.removeListener(this.listener);
		navigator.mediaDevices.ondevicechange = null;
		this.handleCallingTimeout();
	}

	listener = {
		message: ({ message: { type, candidate, sdp }, ...message }) => {
			const {
				callData: { senderId, conversation_id, name },
				sendMessage,
				publish
			} = this.props;
			console.log(type);
			switch (type) {
				case "call-ok":
					if (senderId !== getLoginId()) this.handleLocalDescription();
					break;
				case "video-offer": //When I receive a call
					this.handleVideoOffer(sdp);
					break;
				case "video-answer": //When I send a call
					sendMessage({ content: `You called ${name}.`, type: "success" });
					this.setRemoteDescription(sdp);
					break;
				case "video-candidate":
					this.handleVideoCandidate(candidate);
					break;
				case "call-busy":
					if (!this.inCall()) this.handleNoCall();
					break;
				case "call-stop":
					if (this.inCall()) this.stopCall();
					else this.handleNoCall();
					break;
				case "i-am-online":
					clearTimeout(this.areYouOnlineTimeout);
					this.setState({ loadingRemoteVideo: false });
					break;
				case "are-you-online":
					this.handleAreYouOnline();
					break;
				case "call":
					publish("call-busy", message.senderId);
					break;
				case "call-push-received":
					publish("call", senderId, { name: getName(), senderId: getLoginId(), conversation_id });
					break;
				default:
					break;
			}
		}
	};

	handleCallingTimeout = _ => {
		if (this.callingTimeout) {
			clearTimeout(this.callingTimeout);
			this.callingTimeout = null;
		}
	};

	localSrc = _ => document.getElementById("local_video").srcObject;

	inCall = _ =>
		this.peerConnection &&
		this.peerConnection.localDescription &&
		this.peerConnection.remoteDescription;

	handleNoCall = () => {
		const {
			currentChat: { name },
			setSnackbar,
			switchToChat
		} = this.props;
		setSnackbar({ message: `${name} is busy.` });
		setTimeout(switchToChat, 5000);
	};

	mediaConstraints = () => {
		const { audioinput, videoinput } = localStorage;
		return {
			audio: audioinput ? { deviceId: { ideal: audioinput } } : true,
			video: videoinput ? { deviceId: { ideal: videoinput } } : true
		};
	};

	handleAreYouOnline = () => {
		clearTimeout(this.areYouOnlineTimeout);
		if (this.state.loadingRemoteVideo) this.setState({ loadingRemoteVideo: false });
		const {
			callData: { senderId },
			publish
		} = this.props;
		publish("i-am-online", senderId);
	};

	handleICEConnectionsStateChange = _ => {
		if (
			["failed", "disconnected", "closed"].includes(this.peerConnection.iceConnectionState) &&
			this.inCall()
		) {
			if (!this.state.loadingLocalVideo) this.setState({ loadingRemoteVideo: true });
			const {
				callData: { senderId },
				publish
			} = this.props;
			publish("are-you-online", senderId);
			this.areYouOnlineTimeout = setTimeout(this.stopStream, 20000);
		}
	};

	handleAddTrackAndStream = ({ type, stream, streams }) => {
		if (this.state.loadingRemoteVideo) this.setState({ loadingRemoteVideo: false });
		let remoteVideo = document.getElementById("remote_video");
		if (!remoteVideo.srcObject) remoteVideo.srcObject = type === "addstream" ? stream : streams[0];
	};

	handleMedia = changeTrack => {
		let { loadingLocalVideo, ModalDevicesOpened } = this.state,
			noEndedTracks =
				this.localSrc() &&
				!this.localSrc()
					.getTracks()
					.some(e => e.readyState === "ended");
		return (!changeTrack && noEndedTracks
			? Promise.resolve(this.localSrc())
			: navigator.mediaDevices.getUserMedia(this.mediaConstraints())
		)
			.catch(e => {
				if (this.mounted) {
					if (!this.state.loadingLocalVideo) this.setState({ loadingLocalVideo: true });
					this.props.setSnackbar({ message: "Please connect your media devices and try again." });
					console.error(`error in getUserMedia ${e.name} ${e}`);
					return Promise.reject(e);
				}
			})
			.then(stream => {
				if (this.mounted && stream) {
					if (loadingLocalVideo) this.setState({ loadingLocalVideo: false });
					if (ModalDevicesOpened) this.setState({ ModalDevicesOpened: false });
					if (changeTrack || !this.localSrc())
						document.getElementById("local_video").srcObject = stream;
					let senders = this.peerConnection.getSenders(),
						hasSenders = senders.some(({ track }) => track);
					if (!hasSenders || changeTrack)
						(this.localSrc() || stream).getTracks().forEach(track => {
							if (changeTrack && hasSenders) {
								let sameTrack = senders.find(e => e.track && e.track.kind === track.kind);
								track.enabled = sameTrack.track.enabled;
								sameTrack.replaceTrack(track);
							} else if (!hasSenders) this.peerConnection.addTrack(track, stream);
						});
				}
			})
			.catch(e => console.error(`error in handleMedia ${e.name} ${e}`));
	};

	handleLocalDescription = _ => {
		const {
			callData: { senderId },
			publish
		} = this.props;
		return this.handleMedia()
			.then(_ =>
				isDoctor ? this.peerConnection.createOffer() : this.peerConnection.createAnswer()
			)
			.catch(e => console.error(`error in create ${e.name} ${e}`))
			.then(result => this.peerConnection.setLocalDescription(result))
			.catch(e => console.error(`error in setLocalDescription ${e.name} ${e}`))
			.then(() =>
				publish(`video-${isDoctor ? "offer" : "answer"}`, senderId, {
					sdp: this.peerConnection.localDescription
				})
			);
	};

	handleVideoOffer = sdp => {
		if (!this.peerConnection.remoteDescription && sdp)
			this.setRemoteDescription(sdp).then(this.handleLocalDescription);
	};

	setRemoteDescription = sdp => {
		this.handleCallingTimeout();
		if (!this.peerConnection.remoteDescription && sdp)
			return this.peerConnection
				.setRemoteDescription(new RTCSessionDescription(sdp))
				.catch(e => console.error(`error in setRemoteDescription ${e.name} ${e}`));
	};

	handleVideoCandidate = candidate => {
		if (this.peerConnection.remoteDescription && candidate)
			this.peerConnection
				.addIceCandidate(new RTCIceCandidate(candidate))
				.catch(e => console.error(`error in addIceCandidate ${e.name} ${e}`));
	};

	handleIceCandidate = ({ candidate }) => {
		if (candidate) {
			const {
				callData: { senderId },
				publish
			} = this.props;
			publish("video-candidate", senderId, { candidate });
		}
	};

	toggleTrack = ({ target: { name } }) => {
		if (this.localSrc()) {
			let localTrack = this.localSrc()
				.getTracks()
				.find(e => e.kind === name);
			if (localTrack && localTrack.readyState === "live") {
				this.setState(state => ({ [name]: !state[name] }));
				localTrack.enabled = !localTrack.enabled;
				let senders = this.peerConnection.getSenders();
				if (senders.length)
					senders.find(e => e.track && e.track.kind === name).replaceTrack(localTrack);
			}
		}
	};

	stopCall = e => {
		if (e && e.type === "beforeunload") {
			e.preventDefault();
			e.returnValue = "returned";
			return "returned";
		}
		const {
			switchToChat,
			sendMessage,
			callData: { senderId, name },
			publish
		} = this.props;
		if (!e && this.callingTimeout)
			sendMessage({ content: `${name} didn't pick up.`, type: "timeout" });
		else if (!this.inCall() && !this.areYouOnline)
			sendMessage({ content: "You cancelled the call.", type: "cancelled" });
		publish(this.inCall() ? "call-stop" : "cancel-call", senderId);
		if (this.state.loadingRemoteVideo) this.setState({ loadingRemoteVideo: false });
		if (this.peerConnection) {
			this.peerConnection.getSenders().forEach(e => e.track && e.track.stop());
			this.peerConnection.ontrack = null;
			this.peerConnection.onnicecandidate = null;
			this.peerConnection.onaddstream = null;
			this.peerConnection.oniceconnectionstatechange = null;
			this.peerConnection.close();
			this.peerConnection = null;
		}
		if (this.localSrc()) {
			document.getElementById("local_video").pause();
			document
				.getElementById("local_video")
				.srcObject.getTracks()
				.forEach(track => track.stop());
		}
		if (this.areYouOnline) clearTimeout(this.areYouOnline);
		switchToChat();
	};

	openModalDevices = _ => this.setState({ ModalDevicesOpened: true });

	toggleModalDevices = _ => this.handleMedia(true);

	secondaryVideoToMain = _ => this.setState(({ mainRemote }) => ({ mainRemote: !mainRemote }));

	toggleMessages = _ => this.setState(({ showMessages }) => ({ showMessages: !showMessages }));

	render() {
		const {
			props: {
				currentChat: { name }
			},
			state: {
				loadingRemoteVideo,
				loadingLocalVideo,
				mainRemote,
				showMessages,
				audio,
				video,
				ModalDevicesOpened
			},
			toggleModalDevices
		} = this;
		return (
			<div className="video-wrapper">
				<div className="callee-name">{`${isDoctor ? "" : "Dr. "}${name}`}</div>
				<div className={`video-conversation ${showMessages ? "video-conversation-opened" : ""}`}>
					<Conversation height="calc(100vh - 105px)" />
				</div>
				<div
					className={`${mainRemote ? "main" : "secondary"}-video-wrapper`}
					{...(!mainRemote && { onClick: this.secondaryVideoToMain })}>
					{loadingRemoteVideo && Spinner()}
					<video id="remote_video" autoPlay />
				</div>
				<div
					className={`${mainRemote ? "secondary" : "main"}-video-wrapper`}
					{...(mainRemote && { onClick: this.secondaryVideoToMain })}>
					{loadingLocalVideo && Spinner()}
					<video id="local_video" autoPlay muted />
				</div>
				<div className={`video-buttons${showMessages ? " chat-opened" : ""}`}>
					<img
						src="/img/chaticon-01.png"
						alt="open chat"
						height="50"
						onClick={this.toggleMessages}
					/>
					<img
						src={`/img/mic${audio ? "on" : "off"}.png`}
						height="50"
						alt="toggle audio"
						name="audio"
						onClick={this.toggleTrack}
					/>
					<img
						src={`/img/video${video ? "on" : "off"}-01.png`}
						height="50"
						alt="toggle video"
						name="video"
						onClick={this.toggleTrack}
					/>
					<img src="/img/phone-01.png" alt="hang up" height="50" onClick={this.stopCall} />
					<img
						onClick={this.openModalDevices}
						src="/img/gear-01.png"
						alt="open ModalDevices"
						height="50"
					/>
				</div>
				<ModalDevices open={ModalDevicesOpened} onClose={toggleModalDevices} />
			</div>
		);
	}
}

export const VideoApp = connect(
	({ currentChat, chats, callData, pubnub: { addListener, removeListener, publish } }) => ({
		currentChat,
		chats,
		callData,
		addListener,
		removeListener,
		publish
	}),
	{ sendMessage, setCurrentChat, switchToChat }
)(_VideoApp);
