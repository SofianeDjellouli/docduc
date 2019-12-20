import React, { useCallback, memo } from "react";
import { Button } from "@material-ui/core";
import { defaultField } from "../../utils";
import { Modal } from "../";

const _Confirm = ({ open, onClose, handleClose }) => {
	const closeHandle = useCallback(
		_ => {
			onClose();
			handleClose();
		},
		[onClose, handleClose]
	);
	return (
		<Modal
			title="Are you sure you want to quit?"
			{...{ open, onClose }}
			actions={
				<Button color="primary" onClick={closeHandle}>
					Yes
				</Button>
			}
		/>
	);
};

export const Confirm = memo(_Confirm);
export const defaultForm = { password: defaultField, confirmPassword: defaultField };

export const getUrlParam = arg =>
	(new URLSearchParams(window.location.search).get(arg) || "").replace(" ", "+");
