import React, { useState, useCallback, Fragment } from "react";
import { StripeProvider, Elements, injectStripe } from "react-stripe-elements";
import { Button } from "@material-ui/core";
import { A } from "hookrouter";
import { ModalService } from "../";
import "./style.css";

const _PendingPayments = ({ pending, stripe }) => {
	const [service, setService] = useState(undefined);
	const handleService = useCallback(
		({
			currentTarget: {
				dataset: { i }
			}
		}) => setService(pending[i]),
		[pending]
	);
	return (
		<div className="tabContent">
			<h2 className="h2 pending">Pending Payments</h2>
			<div className="to-pay">
				Payment for these services didn't go throught. To pay for it, please{" "}
				<A href="/settings/payment-method">update your card info</A>.
			</div>
			{pending &&
				pending.map(({ ID, service_description, service_сode }, i) => (
					<Fragment key={ID}>
						<div className="pending-payment">
							<div>{`${service_сode} - ${service_description}`}</div>
							<Button onClick={handleService} color="primary" data-i={i}>
								Details
							</Button>
						</div>
						<hr className="pending-hr" />
					</Fragment>
				))}
			<ModalService {...{ service, setService }} />
		</div>
	);
};

const InjectedComponent = injectStripe(_PendingPayments);

export const PendingPayments = ({ stripe, pending }) => (
	<StripeProvider {...{ stripe }}>
		<Elements>
			<InjectedComponent {...{ pending }} />
		</Elements>
	</StripeProvider>
);
