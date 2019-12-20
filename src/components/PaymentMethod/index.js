import React, { useCallback, Fragment, memo } from "react";
import { StripeProvider, Elements, injectStripe } from "react-stripe-elements";
import { Card, useToggle, patientsRequest, handlePromise } from "../../utils";
import { Modal } from "../";
import { Button } from "@material-ui/core";
import "./style.css";

const _MethodForm = ({ stripe, open, onClose, setSnackbar, setCard }) => {
	const { toggle, toggled } = useToggle();

	const handleSubmit = useCallback(
		() =>
			handlePromise(
				stripe.createToken().then(({ error: { message } = {}, token: { id } = {} }) => {
					if (message) setSnackbar({ message });
					else
						return patientsRequest
							.post("payment/update_card_info", { token: id })
							.then(({ data: { exp_month, exp_year, last_digits } = {} }) => {
								setSnackbar({ message: "Thanks!", type: 0 });
								setCard({
									number: `**** **** **** ${last_digits}`,
									date: `${exp_month}/${exp_year.toString().slice(2, 4)}`
								});
							})
							.then(onClose);
				}),
				toggle,
				setSnackbar
			),
		[setSnackbar, stripe, toggle, onClose, setCard]
	);
	return (
		<Modal
			{...{ open, onClose }}
			title="Enter your card details"
			actions={
				<Fragment>
					<Button onClick={onClose} color="secondary">
						Close
					</Button>
					<Button disabled={toggled} onClick={handleSubmit} color="primary">
						{toggled && <i className="fas fa-circle-notch fa-spin right" />}OK
					</Button>
				</Fragment>
			}>
			{Card()}
		</Modal>
	);
};

const MethodForm = memo(_MethodForm);
const _PaymentMethod = ({ card: { number, date } = {}, ...props }) => {
	const toggleForm = useToggle();

	return (
		<div className="tabContent payment-method">
			<h4>Registered card</h4>
			<fieldset>
				<label>
					{number ? (
						<Fragment>
							<div>{number}</div>
							<div className="space" />
							<div>{date}</div>
						</Fragment>
					) : (
						"No cards found"
					)}
				</label>
			</fieldset>
			<button onClick={toggleForm.toggle} className="btn softo-solid-btn">
				{number ? "Update" : "Add"}
			</button>
			<MethodForm open={toggleForm.toggled} onClose={toggleForm.toggle} {...props} />
		</div>
	);
};

const InjectedComponent = injectStripe(_PaymentMethod);

export const PaymentMethod = ({ stripe, ...props }) => (
	<StripeProvider {...{ stripe }}>
		<Elements>
			<InjectedComponent {...props} />
		</Elements>
	</StripeProvider>
);
