import React, { memo, useState, useCallback, Fragment } from "react";
import { Button } from "@material-ui/core";
import { Modal, RenderInput } from "../";
import { defaultForm } from "./utils";
import "./style.css";

const _ModalAllergy = ({ onAllergy, open, onClose }) => {
	const [form, setForm] = useState(defaultForm),
		onChange = useCallback(
			({ target: { name, value } }) => setForm(form => ({ ...form, [name]: { value, error: "" } })),
			[]
		),
		handleName = useCallback(
			name => ({
				placeholder: `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`,
				multiline: true,
				fullWidth: true,
				col: 12,
				name,
				onChange,
				...form[name]
			}),
			[onChange, form]
		),
		handleAllergy = useCallback(
			e => {
				e.preventDefault();
				const _form = { ...form },
					formKeys = Object.keys(_form);
				for (let i = 0; i < formKeys.length; i++) {
					const key = formKeys[i];
					if (!_form[key].value) _form[key].error = "This field is required";
				}
				for (let i = 0; i < formKeys.length; i++)
					if (_form[formKeys[i]].error) return setForm(_form);
				setForm(defaultForm);
				const { allergy, reaction } = form;
				onAllergy({ name: allergy.value, reaction: reaction.value });
			},
			[onAllergy, form]
		);
	return (
		<Modal
			title="Add an allergy"
			{...{ open, onClose }}
			PaperProps={{ component: "form", onSubmit: handleAllergy }}
			actions={
				<Fragment>
					<Button color="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" color="primary">
						Add
					</Button>
				</Fragment>
			}>
			<RenderInput autoFocus {...handleName("allergy")} />
			<RenderInput {...handleName("reaction")} />
		</Modal>
	);
};

export const ModalAllergy = memo(_ModalAllergy);
