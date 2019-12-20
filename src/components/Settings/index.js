import React, { Fragment, PureComponent } from "react";
import { navigate } from "hookrouter";
import { Grid } from "@material-ui/core";
import {
	//Subscription,
	Payout,
	Credentials,
	DoctorProfile,
	PatientProfile,
	Dashboard,
	PendingPayments,
	Spinner,
	PaymentMethod
} from "../";
import {
	baseAuthRequest,
	isDoctor,
	GlobalContext,
	STRIPE_KEY,
	handlePromise,
	loadScript
} from "../../utils";
import "../../style/tabs.css";
import "./style.css";

// const { origin, pathname, hash, search } = window.location;

class Settings extends PureComponent {
	state = {
		stripe: null,
		data: {},
		pending: [],
		loading: true,
		account: {},
		card: {}
	};

	setData = data => this.setState({ data });

	componentDidMount() {
		// if (search) window.history.replaceState({}, document.title, origin + pathname + hash);
		const doctor = isDoctor();
		handlePromise(
			Promise.all([
				loadScript("https://js.stripe.com/v3/", window.Stripe),
				...(doctor
					? ["doctor", "payment/account_balance", "payment/account_info"]
					: ["patient", "patients/booking/get_pending_services", "patients/payment/get_card_info"]
				).map(baseAuthRequest.get)
			]).then(([stripe, { data }, ...rest]) => {
				const { exp_month, exp_year, last_digits } = rest[1].data || {};
				this.setState({
					loading: false,
					data,
					stripe: window.Stripe(STRIPE_KEY),
					...(doctor
						? { account: rest.map(({ data }) => data).reduce((a, e) => ({ ...a, ...e }), {}) }
						: {
								pending: rest[0].data.map(
									({
										ID,
										diagnoses,
										service_сode, //Russian "c" for getting
										service_description,
										price,
										payment_type,
										insurance_type,
										status
									}) => ({
										ID,
										diagnoses,
										service_сode,
										service_description,
										price,
										payment_type,
										insurance_type,
										status
									})
								),
								card: {
									...(last_digits && {
										number: `**** **** **** ${last_digits}`,
										date: `${exp_month}/${exp_year.toString().slice(2, 4)}`
									})
								}
						  })
				});
			}),
			null
		);
	}

	setCard = card => this.setState({ card });

	handleTab = ({ target: { name } }) => navigate(`/settings/${name}`);

	render() {
		const { pending } = this.state,
			{ tab } = this.props,
			doctor = isDoctor();
		return (
			<GlobalContext.Consumer>
				{({ setSnackbar }) => (
					<main className="settings">
						<div className="tabs">
							<div>
								{[
									"profile",
									"credentials",
									...(doctor
										? ["payout", "dashboard"]
										: ["payment-method", ...(pending.length > 0 ? ["pending-payments"] : [])])
								].map((e, i) => (
									<Fragment key={e}>
										<input
											type="radio"
											checked={tab === e}
											name={e}
											id={`tab${i}`}
											onChange={this.handleTab}
										/>
										<label htmlFor={`tab${i}`}>{e.replace(/-/g, " ")}</label>
									</Fragment>
								))}
								<div className="slider" />
							</div>
						</div>
						<Grid container spacing={3} justify="center" className="container">
							{(_ => {
								const {
										setSnackbar,
										setCard,
										setData,
										props: { tab },
										state: { data, stripe, pending, loading, account, card }
									} = this,
									{ ID, email, firstName, lastName } = data,
									credentialsProps = { ID, email, key: ID, firstName, lastName },
									profileProps = { ...data, setSnackbar, setData };
								if (loading) return Spinner();
								if (doctor)
									switch (tab) {
										// case "subscription":
										//   return <Subscription {...{ stripe,setSnackbar, ...profileProps }} />;
										case "payout":
											return <Payout {...{ stripe, setSnackbar, ...account }} />;
										case "profile":
											return <DoctorProfile {...profileProps} />;
										case "dashboard":
											return <Dashboard />;
										default:
											return <Credentials {...credentialsProps} />;
									}
								else
									switch (tab) {
										case "profile":
											return <PatientProfile {...profileProps} />;
										case "pending-payments":
											return <PendingPayments {...{ stripe, pending }} />;
										case "payment-method":
											return <PaymentMethod {...{ stripe, card, setSnackbar, setCard }} />;
										default:
											return <Credentials {...credentialsProps} />;
									}
							})()}
						</Grid>
					</main>
				)}
			</GlobalContext.Consumer>
		);
	}
}

export default Settings;
