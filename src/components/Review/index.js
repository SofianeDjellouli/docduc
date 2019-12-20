import React, { memo, useCallback, useState, useContext } from "react";
import { Input, Button } from "@material-ui/core";
import { Modal, Zoom } from "../";
import {
	useToggle,
	PatientCalendarContext,
	baseAuthRequest,
	GlobalContext,
	handlePromise
} from "../../utils";
import { defaultForm } from "./utils";
import "./style.css";

const _Review = ({ id, doctor_id, name, onClose, open }) => {
	const { setSnackbar } = useContext(GlobalContext),
		{ setEvents } = useContext(PatientCalendarContext),
		[form, setForm] = useState(defaultForm),
		[hovered, setHovered] = useState(0),
		toggleLoading = useToggle(),
		onMouseOver = useCallback(
			({
				currentTarget: {
					dataset: { i }
				}
			}) => setHovered(parseInt(i)),
			[]
		),
		onMouseOut = useCallback(_ => setHovered(0), []),
		handleRate = useCallback(
			({
				currentTarget: {
					dataset: { i }
				}
			}) => setForm(form => ({ ...form, rate: { value: parseInt(i), error: "" } })),
			[]
		),
		handleChange = useCallback(
			({ target: { value } }) => setForm(form => ({ ...form, comment: { value, error: "" } })),
			[]
		),
		handleClose = useCallback(
			_ => {
				setForm(defaultForm);
				onClose();
			},
			[onClose]
		),
		handleSubmit = useCallback(
			_ => {
				const { comment, rate } = form;
				let errors = { ...form };
				["comment", "rate"].forEach(e => {
					if (!form[e].value) errors[e] = { ...errors[e], error: `Please enter a ${e}.` };
				});
				const errorsKeys = Object.keys(errors);
				for (let i = 0; i < errorsKeys.length; i++)
					if (errors[errorsKeys[i]].error) return setForm(form => ({ ...form, ...errors }));

				return handlePromise(
					baseAuthRequest
						.post("review", {
							appointment_id: id,
							comment: comment.value,
							rate: rate.value,
							doctor_id
						})
						.then(_ => {
							setSnackbar({ message: "Thanks", type: 0 });
							setEvents(events => {
								for (let i = 0; i < events.length; i++)
									if (events[i].id === id)
										return [
											...events.slice(0, i),
											{ ...events[i], is_reviewed: true },
											...events.slice(i + 1)
										];
								return events;
							});
						}),
					toggleLoading.toggle
				).then(handleClose);
			},
			[form, id, doctor_id, toggleLoading.toggle, handleClose, setEvents, setSnackbar]
		);

	const { comment, rate } = form;
	return (
		<Modal
			TransitionComponent={Zoom}
			className="review-modal"
			title={`Leave a review for ${name}`}
			actions={
				<Button color="primary" onClick={handleSubmit} disabled={toggleLoading.toggled}>
					{toggleLoading.toggled && <i className="fas fa-circle-notch fa-spin right" />}
					OK
				</Button>
			}
			onClose={handleClose}
			{...{ open }}>
			<div className="rate">
				{[1, 2, 3, 4, 5].map(e => (
					<i
						key={e}
						data-i={e}
						onClick={handleRate}
						className={`fa${
							(hovered && hovered > rate.value ? hovered : rate.value) >= e ? "s" : "r"
						} fa-star`}
						{...{ onMouseOver, onMouseOut }}
					/>
				))}
			</div>
			{Boolean(rate.error) && <div className="error">{rate.error}</div>}
			<Input fullWidth multiline autoFocus value={comment.value} onChange={handleChange} />
			{comment.error && <div className="error">{comment.error}</div>}
		</Modal>
	);
};

export const Review = memo(_Review);
