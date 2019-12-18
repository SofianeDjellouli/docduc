import React, { Component } from "react";
import { StripeProvider, Elements, injectStripe } from "react-stripe-elements";
import axios from "axios";
import { API, AUTH, Card } from "./../globalUtils";

class Subscription extends Component {
  constructor(props) {
    super(props);
    const { firstName, lastName, email, addressLine1, city, state, zip } = props.data;
    this.state = {
      plan: "yearly",
      name: `${firstName} ${lastName}`,
      email,
      address:
        addressLine1 && (addressLine1.includes(",") ? addressLine1.split(",")[0] : addressLine1),
      city,
      state,
      zip,
      sending: false
    };
  }

  togglePlan = () =>
    this.setState(({ plan }) => ({ plan: plan === "yearly" ? "monthly" : "yearly" }));

  handleSubmit = e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    const { stripe, setSnackbar } = this.props;
    if (stripe)
      this.setState({ sending: true }, _ =>
        stripe
          .createToken()
          .then(({ error: { message } = {}, token: { id } = {} }) => {
            if (message) setSnackbar({ message });
            else
              axios
                .post(
                  API + "subscribe_doctor",
                  { token: id, plan_id: this.state.plan === "yearly" ? 2 : 1, save_user: true },
                  AUTH
                )
                .then(() => setSnackbar({ message: "Thanks!", type: 0 }));
          })
          .then(_ => this.setState({ sending: false }))
      );
    else setSnackbar("Stripe hasn't loaded yet. Please try again later.");
  };

  render() {
    const { plan, name, email, address, city, zip, state, sending } = this.state;
    return (
      <div className="tabContent" id="subscriptionContent">
        <div className="subscriptionInfoContainer">
          <div id="subscriptionInfoSection" className="subscriptionContent">
            <div id="price-card">
              <div className="pricing-single">
                <div className="pricing-single-header">
                  <h3>Premium</h3>
                </div>
                <div className="pricing-single-content">
                  <div className="priceInfo">
                    <div className="planPrice">{plan === "yearly" ? "290" : "390"}</div>
                    <div className="planPeriod">/mo</div>
                  </div>
                  <div className="center-block">
                    <ul className="nav nav-tabs">
                      <li
                        className={plan === "monthly" ? "active" : undefined}
                        onClick={this.togglePlan}>
                        <div>Monthly</div>
                      </li>
                      <li
                        className={plan === "yearly" ? "active" : undefined}
                        onClick={this.togglePlan}>
                        <div>Yearly</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <section>
              <h4>Payment details</h4>
              <fieldset className="with-state">
                <label>
                  <span>Subscription</span>
                  <div className="field">{`$${plan === "monthly" ? "390" : "3,480"}`}</div>
                </label>
                <label>
                  <span>{"Taxes & Fee"}</span>
                  <div className="field">{`$${plan === "monthly" ? "11.96" : "104.24"}`}</div>
                </label>
                <label>
                  <span>Total</span>
                  <div className="field">{`$${plan === "monthly" ? "401.96" : "3,584.24"}`}</div>
                </label>
              </fieldset>
            </section>
            <section>
              <h4>Personal information</h4>
              <fieldset className="with-state">
                <label>
                  <span>Name</span>
                  <div className="field">{name}</div>
                </label>
                <label>
                  <span>Email</span>
                  <div className="field">{email}</div>
                </label>
                <label>
                  <span>Address</span>
                  <div className="field">{address}</div>
                </label>
                <label>
                  <span>City</span>
                  <div className="field">{city}</div>
                </label>
                <label className="state">
                  <span>State</span>
                  <div className="field">{state}</div>
                </label>
                <label className="zip">
                  <span>ZIP</span>
                  <div className="field">{zip}</div>
                </label>
                <label className="select">
                  <span>Country</span>
                  <div className="field">US</div>
                </label>
              </fieldset>
            </section>
            <section style={{ marginTop: 0 }}>
              <h4>Card information</h4>
              <form onSubmit={this.handleSubmit}>
                {this.props.stripe ? (
                  Card()
                ) : (
                  <fieldset>
                    <label>Loading...</label>
                  </fieldset>
                )}
                <button type="submit" className="btn softo-solid-btn pull-right" disabled={sending}>
                  {sending && <i className="fa fa-spinner fa-spin" />} Subscribe
                </button>
              </form>
            </section>
          </div>
          <div className="benefits">
            <h4>Premium features</h4>
            <ul>
              {[
                "Web & Mobile apps for physician, staff and patient",
                "Searchable by patients in your area",
                "Lower patient acquisition costs",
                "AI diagnosis",
                "HIPAA Compliance",
                "Simple EHR",
                "Lab reports",
                "Unlimited file storage",
                "Insurance eligibility check",
                "Schedule appointments",
                "Video calls",
                "Text messaging",
                "Patient follow-up"
              ].map(e => (
                <li key={e}>
                  <i className="fas fa-check-circle" style={{ marginRight: 10 }} />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const InjectedSubscription = injectStripe(Subscription);

const ExportedSubscription = ({ stripe, ...props }) => (
  <StripeProvider {...{ stripe }}>
    <Elements>
      <InjectedSubscription {...props} />
    </Elements>
  </StripeProvider>
);

export default ExportedSubscription;
