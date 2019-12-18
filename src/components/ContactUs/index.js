import React, { memo, useState, useCallback, useContext } from "react";
import { Grid } from "@material-ui/core";
import { RenderInput, RenderArea, GridForm } from "../";
import { useToggle, getLoginId, GlobalContext, baseRequest, handlePromise } from "../../utils";
import { defaultForm, fields } from "./utils";

const _ContactUs = _ => {
	const { setSnackbar } = useContext(GlobalContext),
		[form, setForm] = useState(defaultForm),
		onChange = useCallback(
			({ target: { name, value } }) =>
				setForm(form => ({ ...form, [name]: { ...form[name], value, error: "" } })),
			[]
		),
		toggleSend = useToggle(),
		handleName = useCallback(
			name => ({ onChange, className: "form-input", name, "aria-label": name, ...form[name] }),
			[form, onChange]
		),
		handleSubmit = useCallback(
			e => {
				e.preventDefault();
				let errors = {};
				for (let i = 0; i < fields.length; i++)
					if (!form[fields[i]].value) errors[fields[i]] = "This field is required";
				const errorKeys = Object.keys(errors);
				if (errorKeys.length)
					setForm(form => {
						let _form = {};
						for (let i = 0; i < errorKeys.length; i++) {
							const field = errorKeys[i];
							_form[field] = { ...form[field], error: errors[field] };
						}
						return { ...form, ..._form };
					});
				else {
					let data = {},
						formKeys = Object.keys(form);
					for (let i = 0; i < formKeys.length; i++) data[formKeys[i]] = form[formKeys[i]].value;
					const user_login_id = getLoginId();
					handlePromise(
						baseRequest
							.post("contact_us", { ...data, ...(user_login_id && { user_login_id }) })
							.then(_ => {
								setForm(defaultForm);
								setSnackbar({
									duration: 10000,
									message: "Thanks. We will come back to you soon.",
									type: 0
								});
							}),
						toggleSend.toggle
					);
				}
			},
			[form, setSnackbar, toggleSend.toggle]
		);
	return (
		<GridForm onSubmit={handleSubmit}>
			<Grid item component="h3" sm={12}>
				Reach us quickly
			</Grid>
			<RenderInput placeholder="First name" {...handleName("first_name")} />
			<RenderInput placeholder="Last name" {...handleName("last_name")} />
			<RenderInput placeholder="Topic" {...handleName("topic")} />
			<RenderInput placeholder="Email" type="email" {...handleName("email")} />
			<RenderArea sm={12} placeholder="Message" {...handleName("message")} />
			<Grid item className="left-auto">
				<button type="submit" disabled={toggleSend.toggled} className="softo-solid-btn">
					{toggleSend.toggled && <i className="fas fa-circle-notch fa-spin right" />}
					Send message
				</button>
			</Grid>
		</GridForm>
	);
};

export const ContactUs = memo(_ContactUs);
