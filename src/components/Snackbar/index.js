import React, { memo } from "react";
import { Snackbar as MuiSnackbar, SnackbarContent, IconButton } from "@material-ui/core";
import "./style.css";

const _Snackbar = ({ message, type = 1, duration = 5000, closeSnackbar }) => (
	<MuiSnackbar
		autoHideDuration={duration}
		open={Boolean(message)}
		onClose={closeSnackbar}
		className="snackbar-wrapper"
		disableWindowBlurListener>
		<div>
			<SnackbarContent
				className={`snackbar-content snackbar-content-${type === 0 ? "success" : "warning"}`}
				message={
					<span className="snackbar-message">
						<i className="material-icons right">{type === 0 ? "check_circle" : "info"}</i>
						{message}
					</span>
				}
				action={
					<IconButton color="inherit" onClick={closeSnackbar}>
						<i className="material-icons">close</i>
					</IconButton>
				}
			/>
		</div>
	</MuiSnackbar>
);

export const Snackbar = memo(_Snackbar);
