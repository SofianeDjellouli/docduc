import React, { memo, useCallback, useState, Fragment } from "react";
import { Button } from "@material-ui/core";
import { DatePicker } from "@material-ui/pickers";
import { Modal, RenderAuto } from "../";
import { defaultField, formatDate, getProcedures } from "../../utils";
import { defaultForm, render } from "./utils";
import "./style.css";

const _ModalProcedure = ({ onProcedure, open, onClose }) => {
	const [form, setForm] = useState(defaultForm),
		handleDate = useCallback(
			value => setForm(form => ({ ...form, date: { value, error: "" } })),
			[]
		),
		handleProcedure = useCallback(
			({ value }) => setForm(form => ({ ...form, procedure: { value, error: "" } })),
			[]
		),
		handleClear = useCallback(_ => setForm(form => ({ ...form, procedure: defaultField })), []),
		addProcedure = useCallback(
			e => {
				e.preventDefault();
				let _form = { ...form },
					formKeys = Object.keys(_form);
				for (let i = 0; i < formKeys.length; i++) {
					const key = formKeys[i];
					if (!_form[key].value) _form[key].error = "This field is required";
				}
				for (let i = 0; i < formKeys.length; i++)
					if (_form[formKeys[i]].error) return setForm(_form);
				const { procedure, date } = form;
				setForm(defaultForm);
				onProcedure({ procedure: procedure.value, date: formatDate(date.value) });
			},
			[form, onProcedure]
		),
		{ value } = form.date,
		{ error } = form.procedure;
	return (
		<Modal
			title="Add a procedure"
			{...{ open, onClose }}
			PaperProps={{ component: "form", onSubmit: addProcedure }}
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
			<RenderAuto
				autoFocus
				fullWidth
				col={12}
				placeholder="Procedure"
				handleClick={handleProcedure}
				getData={getProcedures}
				onClear={handleClear}
				{...{ render, error }}
			/>
			<div className="col-xs-12">
				<DatePicker
					disableFuture
					fullWidth
					format="MM/DD/YYYY"
					emptyLabel="Date of birth"
					onChange={handleDate}
					helperText={error}
					error={!!error}
					{...{ value }}
				/>
			</div>
		</Modal>
	);
};

export const ModalProcedure = memo(_ModalProcedure);
