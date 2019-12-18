import React, { memo, useState, useCallback } from "react";
import { Input, Button } from "@material-ui/core";
import { handlePromise, defaultField, useToggle, baseRequest } from "../../utils";
import { Modal } from "../";
import "./style.css";

const defaultForm = { email: defaultField };

const _ForgotPassword = ({ onClose, open, setSnackbar }) => {
	const [form, setForm] = useState(defaultForm),
		onChange = useCallback(({ target: { value } }) => setForm({ email: { value } }), []),
		{ toggle, toggled } = useToggle(),
		handleClose = useCallback(
			_ => {
				onClose();
				setForm(defaultForm);
			},
			[onClose]
		),
		handleSubmit = useCallback(
			e => {
				e.preventDefault();
				if (!form.email.value)
					setForm(form => ({ email: { ...form.email, error: "Please enter your email." } }));
				else
					handlePromise(
						baseRequest
							.post("forgot_password", { email: form.email.value })
							.then(_ => {
								handleClose();
								setSnackbar({
									message:
										"An email has been sent to you to reset your password (check spam folder).",
									type: 0,
									duration: 10000
								});
							})
							.catch(error => setForm(form => ({ email: { ...form.email, error } }))),
						toggle
					);
			},
			[form, handleClose, setSnackbar, toggle]
		),
		{ error } = form.email;
	return (
		<Modal
			title="Reset password"
			actions={
				<Button type="submit" color="primary" disabled={toggled}>
					{toggled && <i className="fas fa-circle-notch fa-spin right" />}Send
				</Button>
			}
			PaperProps={{ component: "form", onSubmit: handleSubmit }}
			onClose={handleClose}
			{...{ open }}>
			<div className="reset-subtitle">
				Please enter your email address below. You will receive a link to create a new password via
				email.
			</div>
			<Input autoFocus fullWidth {...{ onChange }} value={form.email.value} type="email" />
			{error && <div className="error">{error}</div>}
		</Modal>
	);
};

export const ForgotPassword = memo(_ForgotPassword);
