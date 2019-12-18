import React, { memo } from "react";
import {
	Dialog,
	DialogTitle,
	DialogActions,
	DialogContent,
	IconButton,
	Button
} from "@material-ui/core";
import { useMobile } from "../../utils";
import { Zoom } from "./utils";
import "./style.css";

const _Modal = ({ children, title, actions, onClose, noClose, ...props }) => {
	const isMobile = useMobile();
	return (
		<Dialog disableScrollLock disableBackdropClick fullScreen={isMobile} {...{ onClose, ...props }}>
			<DialogTitle>
				{title}
				<IconButton
					onClick={onClose}
					className="left"
					children={<i className="material-icons">close</i>}
				/>
			</DialogTitle>
			<DialogContent className="scrollbar">{children}</DialogContent>
			<DialogActions>
				{!noClose && <Button onClick={onClose}>Close</Button>}
				{actions}
			</DialogActions>
		</Dialog>
	);
};

export const Modal = memo(_Modal);
export { Zoom };
