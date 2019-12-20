import React, { memo, useCallback, Fragment, useEffect } from "react";
import { Spinner, Tooltip, Modal, /*Condition,*/ Review } from "../";
import { Chip, Button } from "@material-ui/core";
import { useToggle, formatPrice } from "../../utils";
import "./style.css";

const _ModalPatientAppointment = ({
	event: {
		id,
		doctor_id,
		name,
		type,
		status,
		note,
		picture,
		files,
		speciality,
		day,
		month,
		date,
		time,
		comment,
		old,
		is_reviewed,
		symptoms = [],
		// conditions = [],
		procedures = []
	} = {},
	setEventIndex,
	getData,
	loading
}) => {
	const /*[condition, setCondition] = useState(undefined),*/
		onClose = useCallback(_ => setEventIndex(undefined), [setEventIndex]),
		/*handleCondition = useCallback(
				({
					currentTarget: {
						dataset: { i }
					}
				}) => setCondition(conditions[i]),
				[conditions]
			),*/
		handleOpen = useCallback(_ => window.open(picture), [picture]),
		toggleReview = useToggle();
	useEffect(
		_ => {
			if (id /*&& !loading*/) getData(/*symptoms,*/ id);
		},
		[id, getData /*symptoms,*/ /*loading*/]
	);

	return (
		<Modal
			className="appointment-modal"
			title={date}
			open={Boolean(name)}
			{...{
				onClose,
				...(old &&
					!is_reviewed && {
						actions: (
							<Button color="primary" onClick={toggleReview.toggle}>
								Leave a review
							</Button>
						)
					})
			}}>
			<div className="modal-title">{`${type}, ${time}`}</div>
			<div className="modal-title">Doctor</div>
			<div className="doctor">
				<img height="75" width="75" onClick={handleOpen} alt={name} src={picture} />
				<div>
					<div className="user-name">{name}</div>
					<div>{speciality}</div>
				</div>
			</div>
			{note && (
				<Fragment>
					<div className="modal-title">Reason for visit</div>
					{note}
				</Fragment>
			)}
			{files && files.length > 0 && (
				<Fragment>
					<div className="modal-title">Attached files</div>
					<ul>
						{files.map(({ link, name }) => (
							<li key={link}>
								<Tooltip title={<img className="preview" src={link} alt={name} />}>
									<a target="_blank" href={link} rel="noopener noreferrer">
										{name}
									</a>
								</Tooltip>
							</li>
						))}
					</ul>
				</Fragment>
			)}
			<div className="modal-title">Symptoms</div>
			<div className="chips-wrapper">
				{symptoms &&
					symptoms.length > 0 &&
					symptoms.map(({ name }) => <Chip color="primary" key={name} label={name} />)}
			</div>
			{comment && (
				<Fragment>
					<div className="modal-title">Doctor's note</div>
					{comment}
				</Fragment>
			)}
			{procedures && procedures.length > 0 && (
				<Fragment>
					<div className="modal-title">Additionnal procedures</div>
					{procedures.map(
						(
							{
								diagnoses,
								service_сode, //Russian "c" for getting
								service_code, //Normal "c" for posting
								service_description,
								price,
								payment_type,
								insurance_type,
								status
							},
							i
						) => {
							const hasPrice = Boolean(price),
								code = service_сode || service_code,
								priceFormat = formatPrice(price);
							return (
								<Tooltip
									key={code + i}
									type={1}
									title={
										<div className="custom-tooltip">
											<div className="custom-tooltip-title">{`Diagnos${
												diagnoses.length > 1 ? "e" : "i"
											}s`}</div>
											<div className="diagnoses">
												{diagnoses.map(({ description, code }, i) => (
													<code className="appointment__diagnosis" key={code + i}>
														{code} - {description}
													</code>
												))}
											</div>
											<hr />
											<div className="custom-tooltip-title">Service</div>
											<div>{`${code} - ${service_description}`}</div>
											<hr />
											{hasPrice && (
												<Fragment>
													<div className="custom-tooltip-title">Price</div>
													{priceFormat}
													<hr />
												</Fragment>
											)}
											<div className="custom-tooltip-title">Charge</div>
											{hasPrice
												? ["Immediately", "6 months", "12 months"][payment_type]
												: "No charge"}
											<hr />
											{hasPrice && (
												<Fragment>
													<div className="custom-tooltip-title">Insurance</div>
													{["In network", "Assignment", "Cash only"][insurance_type]}
													<hr />
													{(status || status === 0) && (
														<Fragment>
															<div className="custom-tooltip-title">Payment status</div>
															{["Pending", "In progress", "Payed"][status]}
														</Fragment>
													)}
												</Fragment>
											)}
										</div>
									}>
									<Chip
										color="primary"
										label={`${code} - ${
											service_description.length > 20
												? `${service_description.slice(0, 20)}...`
												: service_description
										}${price ? ` - ${priceFormat}` : ""}`}
										className="chip"
									/>
								</Tooltip>
							);
						}
					)}
				</Fragment>
			)}
			{/*conditions && conditions.length > 0 && (
						<Fragment>
							<div className="modal-title">
								Possible conditions
								<Tooltip type={0} title="Deducted from your symptoms using Artificial Intelligence">
									<i className="fas fa-info-circle left primary" />
								</Tooltip>
							</div>
							<div className="chips-wrapper">
								{conditions.map(({ name, condition_id }, i) => (
									<Chip
										color="primary"
										data-i={i}
										key={condition_id}
										label={name}
										onClick={handleCondition}
									/>
								))}
							</div>
						</Fragment>
					)*/}
			{loading && Spinner()}
			{/*<Condition {...{ condition, setCondition }} />*/}
			<Review
				{...{ id, doctor_id, name }}
				open={toggleReview.toggled}
				onClose={toggleReview.toggle}
			/>
		</Modal>
	);
};

export const ModalPatientAppointment = memo(_ModalPatientAppointment);
