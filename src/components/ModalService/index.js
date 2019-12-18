import React, { memo, useCallback, Fragment } from "react";
import { Modal } from "../";
import { formatPrice } from "../../utils";
import "./style.css";

const _ModalService = ({
	service: {
		diagnoses,
		service_сode, //Russian "c" for getting
		service_description,
		price,
		payment_type,
		insurance_type,
		status
	} = {},
	setService
}) => {
	const handleClose = useCallback(() => setService(undefined), [setService]),
		hasPrice = Boolean(price),
		priceFormat = formatPrice(price);

	return (
		<Modal
			className="service-details-modal"
			title="Service details"
			open={Boolean(service_description)}
			onClose={handleClose}>
			<div className="to-pay">
				To pay for this service, please <a href="#paymentMethod">update your card info</a>.
			</div>
			<div className="service-details">
				{diagnoses && (
					<Fragment>
						<div className="title-modal">{`Diagnos${diagnoses.length > 1 ? "e" : "i"}s`}</div>
						<div className="wrap">
							{diagnoses.map(({ description, code }, i) => (
								<code className="appointment__diagnosis" key={code + i}>
									{code} - {description}
								</code>
							))}
						</div>
					</Fragment>
				)}
				<hr />
				<div className="title-modal">Service</div>
				<div>{`${service_сode} - ${service_description}`}</div>
				<hr />
				{hasPrice && (
					<Fragment>
						<div className="title-modal">Price</div>
						{priceFormat}
						<hr />
					</Fragment>
				)}
				<div className="title-modal">Charge</div>
				{hasPrice ? ["Immediately", "6 months", "12 months"][payment_type] : "No charge"}
				<hr />
				{hasPrice && (
					<Fragment>
						<div className="title-modal">Insurance</div>
						{["In network", "Assignment", "Cash only"][insurance_type]}
						<hr />
						{(status || status === 0) && (
							<Fragment>
								<div className="title-modal">Payment status</div>
								{["Pending", "In progress", "Payed"][status]}
							</Fragment>
						)}
					</Fragment>
				)}
			</div>
		</Modal>
	);
};

export const ModalService = memo(_ModalService);
