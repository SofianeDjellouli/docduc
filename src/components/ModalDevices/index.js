import React, { memo } from "react";
import { Modal } from "../";
import { mapDevices, renderDevices } from "./utils";
import "./style.css";

class _ModalDevices extends React.Component {
	state = { audioDevices: [], videoDevices: [] };

	componentDidMount() {
		this.mounted = true;
		if (this.mounted)
			navigator.mediaDevices.enumerateDevices().then(r => {
				const audioDevices = r.filter(e => e.kind === "audioinput").map(mapDevices),
					videoDevices = r.filter(e => e.kind === "videoinput").map(mapDevices);
				if (videoDevices.length) localStorage.setItem("videoinput", videoDevices[0].deviceId);
				if (audioDevices.length) localStorage.setItem("audioinput", audioDevices[0].deviceId);
				this.setState({ videoDevices, audioDevices });
			});
	}
	componentWillUnmount() {
		this.mounted = false;
	}

	handleChange = ({ target: { name, value } }) => {
		this.setState({ [name]: value });
		localStorage.setItem(name, value);
	};

	render() {
		const { audioDevices, videoDevices, audioinput, videoinput } = this.state;
		return (
			<Modal title="Media settings" {...this.props}>
				<div className="settings-multimedia">
					<div>
						<img src="/img/mic-01.png" height="100" width="100" alt="audio devices" />
						{audioDevices.length > 0 && !audioDevices.some(e => Boolean(e.label)) ? (
							<div className="no-devices-detected">
								Please allow access to your microphone in your browser's settings then refresh the
								page.
							</div>
						) : audioDevices.length > 0 ? (
							<select
								className="form-input"
								onChange={this.handleChange}
								value={audioinput}
								name="audioinput">
								{audioDevices.map(renderDevices)}
							</select>
						) : (
							<div className="no-devices-detected">No microphone detected.</div>
						)}
					</div>
					<div>
						<img src="/img/video-01.png" height="100" width="100" alt="video devices" />
						{videoDevices.length > 0 && !videoDevices.some(e => Boolean(e.label)) ? (
							<div className="no-devices-detected">
								Please allow access to your camera in your browser's settings then refresh the page.
							</div>
						) : videoDevices.length > 0 ? (
							<select
								className="form-input"
								onChange={this.handleChange}
								value={videoinput}
								name="videoinput">
								{videoDevices.map(renderDevices)}
							</select>
						) : (
							<div className="no-devices-detected">No camera detected.</div>
						)}
					</div>
				</div>
			</Modal>
		);
	}
}

export const ModalDevices = memo(_ModalDevices);
