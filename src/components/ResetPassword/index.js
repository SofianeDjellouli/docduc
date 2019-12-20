import React, { memo, useState, useCallback, Fragment, useContext } from "react";
import { Input, Button } from "@material-ui/core";
import { handlePromise, baseRequest, useToggle, GlobalContext } from "../../utils";
import { Zoom, Modal, Tooltip } from "../";
import { defaultForm, Confirm, getUrlParam } from "./utils";
import "./style.css";

const _ResetPassword = ({ onClose, open }) => {
	const { setSnackbar } = useContext(GlobalContext),
		[form, setForm] = useState(defaultForm),
		[error, setError] = useState(""),
		onChange = useCallback(
			({ target: { value, name } }) => setForm(form => ({ ...form, [name]: { value } })),
			[]
		),
		toggleLoading = useToggle(),
		toggleConfirm = useToggle(),
		toggleShow = useToggle(),
		field = useCallback(
			(name, props) => {
				const { value, error } = form[name];
				return (
					<Fragment>
						<Input
							fullWidth
							error={Boolean(error)}
							endAdornment={
								<Tooltip
									title={`${toggleShow.toggled ? "Hide" : "Show"} passwords`}
									children={
										<i
											onClick={toggleShow.toggle}
											className={`far fa-eye${toggleShow.toggled ? "" : "-slash"} primary pointer`}
										/>
									}
								/>
							}
							{...{
								onChange,
								value,
								name,
								...props,
								...(!toggleShow.toggled && { type: "password" })
							}}
						/>
						{error && <div className="error">{error}</div>}
					</Fragment>
				);
			},
			[onChange, form, toggleShow]
		),
		handleClose = useCallback(
			_ => {
				window.history.replaceState("", document.title, window.location.pathname);
				onClose();
				setForm(defaultForm);
			},
			[onClose]
		),
		handleSubmit = useCallback(
			e => {
				e.preventDefault();
				let errors = { ...form },
					formKeys = ["password", "confirmPassword"];
				if (form.password.value !== form.confirmPassword.value)
					errors.confirmPassword.error = "Passwords must match.";
				for (let i = 0; i < formKeys.length; i++) {
					const key = formKeys[i];
					if (!form[key].value) errors[key] = { ...errors[key], error: "This field is required." };
					else if (form[key].value.length < 8)
						errors[key] = { ...errors[key], error: "Minimum length of 8 characters." };
				}

				for (let i = 0; i < formKeys.length; i++)
					if (errors[formKeys[i]].error) return setForm(errors);
				return handlePromise(
					baseRequest
						.post("resetpassword", {
							email: getUrlParam("email").replace(" ", "+"),
							token: getUrlParam("token"),
							password: form.password.value
						})
						.then(_ => {
							setSnackbar({
								message: "It worked! You can now login with your new password.",
								type: 0,
								duration: 10000
							});
							handleClose();
						})
						.catch(setError),
					toggleLoading.toggle
				);
			},
			[form, handleClose, setSnackbar, toggleLoading.toggle]
		);
	return (
		<Modal
			TransitionComponent={Zoom}
			title="Please enter your new password"
			className="reset-password-modal"
			actions={
				<Button color="primary" type="submit" disabled={toggleLoading.toggled}>
					{toggleLoading.toggled && <i className="fas fa-circle-notch fa-spin right" />}Send
				</Button>
			}
			PaperProps={{ component: "form", onSubmit: handleSubmit }}
			onClose={toggleConfirm.toggle}
			{...{ open }}>
			{field("password", { placeholder: "New password", autoFocus: true })}
			{field("confirmPassword", { placeholder: "Confirm password" })}
			{error && <div className="error">{error}</div>}
			<Confirm open={toggleConfirm.toggled} onClose={toggleConfirm.toggle} {...{ handleClose }} />
		</Modal>
	);
};

export const ResetPassword = memo(_ResetPassword);
