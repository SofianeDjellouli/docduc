import React, { useContext, useCallback, Fragment, useState, memo } from "react";
import { GridForm, RenderInput } from "../";
import {
	GlobalContext,
	handlePromise,
	getLoginId,
	getEmail,
	getName,
	baseRequest,
	useToggle
} from "../../utils";
import { defaultForm } from "./utils";
import "./style.css";

const _AddDoctorForm = ({ toggleForm }) => {
	const { setSnackbar } = useContext(GlobalContext),
		[form, setForm] = useState(defaultForm),
		{ toggle } = useToggle(),
		[errors, setErrors] = useState(defaultForm),
		handleChange = useCallback(({ target: { name, value } }) => {
			setForm(form => ({ ...form, [name]: value }));
			setErrors(errors => ({ ...errors, ...(errors[name] && { [name]: "" }) }));
		}, []),
		handleName = useCallback(
			name => ({ name, value: form[name], error: errors[name], onChange: handleChange }),
			[form, errors, handleChange]
		),
		handleSubmit = useCallback(
			e => {
				e.preventDefault();
				let errors = {},
					{ name, mail, phone, doctorPhone, doctorMail, doctorName } = form,
					formKeys = Object.keys(getLoginId() ? { doctorPhone, doctorMail, doctorName } : form);
				for (let i = 0; i < formKeys.length; i++)
					if (!form[formKeys[i]]) errors[formKeys[i]] = "This field is required";
				if (Object.keys(errors).length) setErrors(error => ({ ...error, ...errors }));
				else
					handlePromise(
						baseRequest
							.post("contact_us", {
								topic: "Add my doctor to your app",
								message: `Hello. I would like you to contact my doctor and invite him to your app. His name is ${doctorName} with email: ${doctorMail} and phone: ${doctorPhone}. My name is ${name ||
									getName()}${getLoginId ? "" : `, my phone is ${phone}`} and my mail is ${mail ||
									getEmail()}.`,
								...(getLoginId() && { user_login_id: getLoginId() })
							})
							.then(_ => {
								setForm(defaultForm);
								setSnackbar("Thanks!", 1);
								if (toggleForm) toggleForm();
							}),
						toggle
					);
			},
			[toggle, form, setSnackbar, toggleForm]
		);
	return (
		<GridForm className="add-doctor-form" onSubmit={handleSubmit}>
			{!getLoginId && (
				<Fragment>
					<RenderInput {...handleName("name")} placeholder="Your name" />
					<RenderInput {...handleName("phone")} placeholder="Your phone" type="tel" minLength="7" />
					<RenderInput {...handleName("mail")} placeholder="Your email" type="email" />
					<hr />
				</Fragment>
			)}
			<RenderInput {...handleName("doctorName")} placeholder="Doctor's name" />
			<RenderInput
				{...handleName("doctorPhone")}
				placeholder="Doctor's phone"
				type="tel"
				minLength="7"
			/>
			<RenderInput {...handleName("doctorMail")} placeholder="Doctor's email" type="email" />
			<div className="flex-center">
				<button type="submit" className="softo-solid-btn">
					Add my doctor
				</button>
			</div>
		</GridForm>
	);
};

export const AddDoctorForm = memo(_AddDoctorForm);
