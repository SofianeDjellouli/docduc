import React, { Component, Fragment } from "react";
import { Grid } from "@material-ui/core";
import { StripeProvider, Elements, injectStripe } from "react-stripe-elements";
import { Card, paymentRequest } from "../../utils";
import { days, months, years, setAmount, handleZeroBalance } from "./utils";

class _Payout extends Component {
  constructor(props) {
    super(props);
    const { dob, first_name, last_name, verification_status } = props,
      dobDate = new Date(dob),
      dobObject = dob
        ? {
            dayOfBirth: dobDate.getUTCDate().toString(),
            monthOfBirth: (dobDate.getMonth() + 1).toString(),
            yearOfBirth: dobDate.getFullYear().toString()
          }
        : { monthOfBirth: "7", dayOfBirth: "12", yearOfBirth: "1980" };
    this.state = {
      balance: "available",
      account: "debit",
      SSN: "",
      routingNumber: "",
      accountNumber: "",
      sending: false,
      first_name,
      last_name,
      verification_status,
      ...dobObject
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    const { stripe, setSnackbar } = this.props,
      {
        routingNumber,
        accountNumber,
        first_name,
        last_name,
        account,
        SSN,
        verification_status,
        dayOfBirth,
        monthOfBirth,
        yearOfBirth
      } = this.state,
      DOB = yearOfBirth + "-" + monthOfBirth.padStart(2, "0") + "-" + dayOfBirth.padStart(2, "0"),
      DOBDate = new Date(DOB),
      isVerified = verification_status === 2,
      isDebit = account === "debit",
      fields = ["first name", "last name", "date of birth", "social security number"],
      fieldsValues = [first_name, last_name, DOB, SSN];

    const emptyIfVerified = a => (isVerified ? "" : a);

    if (!isVerified) {
      for (let i in fieldsValues)
        if (!fieldsValues[i]) {
          setSnackbar({ message: `Please enter your ${fields[i]}.` });
          return;
        }
      if (
        !(DOBDate instanceof Date && !isNaN(DOBDate)) ||
        DOBDate.getUTCDate().toString() !== dayOfBirth ||
        (DOBDate.getMonth() + 1).toString() !== monthOfBirth ||
        DOBDate.getFullYear().toString() !== yearOfBirth
      ) {
        setSnackbar({ message: "Wrong date of birth format." });
        return;
      }
    }

    if (stripe)
      this.setState({ sending: true }, _ =>
        stripe.createToken
          .apply(
            null,
            isDebit
              ? [{ currency: "usd" }]
              : [
                  "bank_account",
                  {
                    country: "US",
                    currency: "usd",
                    routing_number: routingNumber,
                    account_number: accountNumber,
                    account_holder_name: first_name + " " + last_name,
                    account_holder_type: "individual"
                  }
                ]
          )
          .then(({ error: { message } = {}, token: { id } = {} }) => {
            if (message) setSnackbar({ message });
            else
              paymentRequest
                .post("update_doctor_info", {
                  token: id,
                  first_name: emptyIfVerified(first_name),
                  last_name: emptyIfVerified(last_name),
                  ssn: emptyIfVerified(SSN),
                  dob: emptyIfVerified(DOB)
                })
                .then(({ data: { verification_status } = {} }) => {
                  this.setState({ verification_status });
                  setSnackbar({ message: "Thanks!", type: 0 });
                });
          })
          .then(_ => this.setState({ sending: false }))
      );
    else
      setSnackbar({ message: "Stripe hasn't loaded yet. Please try again or refresh the page." });
  };

  togglePlan = _ =>
    this.setState(({ balance }) => ({ balance: balance === "total" ? "available" : "total" }));

  togglePayoutType = _ =>
    this.setState(({ account }) => ({ account: account === "debit" ? "bank" : "debit" }));

  handleChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  render() {
    const {
        balance,
        SSN,
        account,
        routingNumber,
        accountNumber,
        monthOfBirth,
        dayOfBirth,
        yearOfBirth,
        sending,
        first_name,
        last_name,
        verification_status
      } = this.state,
      { available, fee, total } = this.props,
      isDebit = account === "debit",
      isTotal = balance === "total",
      isVerified = verification_status === 2,
      handleTotalAmount = setAmount(isTotal),
      amount = handleTotalAmount(available / 100),
      fees = handleTotalAmount(fee / 100),
      totalAmount = handleTotalAmount((available - fee) / 100),
      balanceAmount = handleZeroBalance((isTotal ? total : available) / 100);
    return (
      <Fragment>
        <Grid item sm={6} xs={12}>
          <div className="pricing-single">
            <div className="pricing-single-header">
              <h3>Balance</h3>
            </div>
            <div className="pricing-single-content">
              <div className="planPrice">{balanceAmount}</div>
              <div className="center-block">
                <ul className="nav nav-tabs">
                  <li
                    className={balance === "available" ? "active" : undefined}
                    onClick={this.togglePlan}>
                    <div>Current</div>
                  </li>
                  <li
                    className={balance === "total" ? "active" : undefined}
                    onClick={this.togglePlan}>
                    <div>Total</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <section>
            <h4>Payout details</h4>
            <fieldset className="with-state">
              <label>
                <span>Amount</span>
                <div className="field">{amount}</div>
              </label>
              <label>
                <span>{"Taxes & Fees"}</span>
                <div className="field">{fees}</div>
              </label>
              <label>
                <span>Total</span>
                <div className="field">{totalAmount}</div>
              </label>
            </fieldset>
          </section>
          <form onSubmit={this.handleSubmit}>
            <section>
              <h4>Personal information</h4>
              <fieldset className="with-state">
                <label>
                  <span>First name</span>
                  <input
                    className="field"
                    name="first_name"
                    value={first_name}
                    placeholder="First name"
                    onChange={this.handleChange}
                    readOnly={isVerified}
                  />
                </label>
                <label>
                  <span>Last name</span>
                  <input
                    className="field"
                    name="last_name"
                    value={last_name}
                    placeholder="Last name"
                    onChange={this.handleChange}
                    readOnly={isVerified}
                  />
                </label>
                <label>
                  <span>Date of birth</span>
                  <div style={{ flex: 1, padding: "0 15px" }}>
                    <select
                      onChange={this.handleChange}
                      value={monthOfBirth}
                      name="monthOfBirth"
                      disabled={isVerified}>
                      {months.map(month => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      onChange={this.handleChange}
                      value={dayOfBirth}
                      name="dayOfBirth"
                      disabled={isVerified}
                      style={{ margin: "0 15px" }}>
                      {days.map(day => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <select
                      onChange={this.handleChange}
                      value={yearOfBirth}
                      name="yearOfBirth"
                      disabled={isVerified}>
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
                <label>
                  <span>SSN</span>
                  <input
                    className="field"
                    name="SSN"
                    value={SSN}
                    placeholder={verification_status !== 2 ? "123-45-6789" : "Verified"}
                    onChange={this.handleChange}
                    readOnly={isVerified}
                  />
                </label>
              </fieldset>
            </section>
            <section style={{ marginTop: 0 }}>
              <h4>{`${isDebit ? "Card" : "Bank"} information`}</h4>
              <div className="center-block">
                <ul className="nav nav-tabs">
                  <li className={isDebit ? "active" : undefined} onClick={this.togglePayoutType}>
                    <div>Debit</div>
                  </li>
                  <li className={!isDebit ? "active" : undefined} onClick={this.togglePayoutType}>
                    <div>Bank</div>
                  </li>
                </ul>
              </div>
              {this.props.stripe ? (
                isDebit ? (
                  Card()
                ) : (
                  <fieldset>
                    <label>
                      <span>Routing number</span>
                      <input
                        className="field"
                        name="routingNumber"
                        value={routingNumber}
                        placeholder="123456789"
                        onChange={this.handleChange}
                        required
                      />
                    </label>
                    <label>
                      <span>Account number</span>
                      <input
                        className="field"
                        name="accountNumber"
                        value={accountNumber}
                        placeholder="1234567890"
                        onChange={this.handleChange}
                        required
                      />
                    </label>
                  </fieldset>
                )
              ) : (
                <fieldset>
                  <label>Loading...</label>
                </fieldset>
              )}
              <button type="submit" className="btn softo-solid-btn pull-right" disabled={sending}>
                {sending && <i className="fa fa-spinner fa-spin" />}{" "}
                {verification_status === 1 || verification_status === 2 ? "Update" : "Submit"}
              </button>
            </section>
          </form>
        </Grid>
        <Grid item sm={6} xs={12}>
          <h4>Account status</h4>
          <div className="center-block">
            <ul className="nav nav-tabs">
              {["Unverified", "Pending", "Verified"].map((e, i) => (
                <li key={e} className={i === verification_status ? "active" : undefined}>
                  <div className="account-status">{e}</div>
                </li>
              ))}
            </ul>
          </div>
        </Grid>
      </Fragment>
    );
  }
}

const InjectedPayout = injectStripe(_Payout);

export const Payout = ({ stripe, ...props }) => (
  <StripeProvider {...{ stripe }}>
    <Elements>
      <InjectedPayout {...props} />
    </Elements>
  </StripeProvider>
);
