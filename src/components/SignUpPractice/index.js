import React, { Component } from "react";
import { navigate, A } from "hookrouter";
import { Grid } from "@material-ui/core";
import { baseRequest, getPlaces, geocode, notFirstCap, hasSpecialChars } from "../../utils";
import { RenderInput, RenderPassword, RenderAutoClear, RenderPhone, GridForm } from "../";
import { fields } from "./utils";
import "./style.css";

class SignUpPractice extends Component {
  state = { ...fields, loading: false, error: "" };

  handleChange = ({ target: { name, value } }) => this.setState({ [name]: { value } });

  handleAddress = ({ value }) =>
    geocode(value).then(results => {
      let address = {};
      const addressKeys = Object.keys(results);
      for (let i = 0; i < addressKeys.length; i++) {
        const key = addressKeys[i];
        address[key] = { value: results[key] };
      }
      this.setState(address);
    });

  handleClearAddress = _ => this.setState({ addressLine1: fields.addressLine1 });

  handleSubmit = e => {
    e.preventDefault();
    const { password, confirmPassword, email, confirmEmail, lat, lng } = this.state;
    let errors = {};
    [lat, lng].forEach(e => {
      if (!e.value)
        errors.error =
          "Sorry, we haven't been able to get coordinates from your address. Please pick an address from the list.";
    });
    if (password.value !== confirmPassword.value)
      ["password", "confirmPassword"].forEach(e => (errors[e] = "Passwords must match."));
    if (email.value !== confirmEmail.value)
      ["email", "confirmEmail"].forEach(e => (errors[e] = "Emails must match."));
    ["firstName", "lastName"].forEach(e => {
      const name = this.state[e].value;
      if (hasSpecialChars(name)) errors[e] = "The name can't include special characters.";
      if (notFirstCap(name)) errors[e] = "Only the first letter of your name may be capitalized.";
    });
    const { addressLine2, zip, loading, error, ...required } = this.state,
      requiredKeys = Object.keys(required);
    for (let i = 0; i < requiredKeys.length; i++) {
      const key = requiredKeys[i];
      if (!this.state[key].value) errors[key] = "This field is required";
    }
    const errorsKeys = Object.keys(errors);
    if (errorsKeys.length)
      this.setState(state => {
        let newState = { ...state };
        for (let i = 0; i < errorsKeys.length; i++) {
          const key = errorsKeys[i];
          if (newState[key]) newState[key].error = errors[key];
        }
        console.log(newState);
        return newState;
      });
    else
      this.setState({ loading: true }, _ => {
        let data = {};
        const {
            lat,
            lng,
            loading,
            error,
            confirmPassword,
            confirmEmail,
            firstName,
            lastName,
            ...rest
          } = this.state,
          restKeys = Object.keys(rest);
        for (let i = 0; i < restKeys.length; i++) {
          const key = restKeys[i];
          data[key] = rest[key].value;
        }
        data.longitude = lng.value.toString();
        data.latitude = lat.value.toString();
        data.manager_first_name = firstName.value;
        data.manager_last_name = lastName.value;
        console.log(data, rest);
        baseRequest
          .post("signup_practice", data)
          .then(_ => navigate("/sign-up-complete"))
          .catch(error => this.setState({ error }))
          .then(_ => this.setState({ loading: false }));
      });
  };

  handleName = name => {
    const { value, error } = this.state[name];
    return { name, value, error, "aria-label": name, onChange: this.handleChange };
  };

  render() {
    const { loading, addressLine1, error } = this.state;
    return (
      <main className="container">
        <div className="main-title">Docduc Health - Practice Sign Up</div>
        <div className="main-subtitle">
          Already have an account? <A href="/sign-in">Sign in</A>
        </div>
        <div className="main-subtitle">* Asterisk fields are mandatory.</div>
        <Grid container spacing={3} justify="center">
          <Grid item sm={6}>
            <GridForm onSubmit={this.handleSubmit}>
              <RenderInput
                autoFocus
                required
                placeholder="Practice name"
                sm={12}
                {...this.handleName("name")}
              />
              <RenderInput
                required
                placeholder="Manager first name"
                {...this.handleName("firstName")}
              />
              <RenderInput
                required
                placeholder="Manager last name"
                {...this.handleName("lastName")}
              />
              <RenderAutoClear
                required
                placeholder="Address"
                sm={12}
                getData={getPlaces}
                title={addressLine1.value}
                handleClick={this.handleAddress}
                onClear={this.handleClearAddress}
                {...this.handleName("addressLine1")}
              />
              <RenderInput placeholder="Apt / Suite" {...this.handleName("addressLine2")} />
              <RenderInput required placeholder="City" {...this.handleName("city")} />
              <RenderInput required placeholder="State" {...this.handleName("state")} />
              <RenderInput placeholder="Zip" {...this.handleName("zip")} />
              <RenderPhone
                required
                placeholder="Phone number"
                sm={12}
                {...this.handleName("phone")}
              />
              <RenderInput required placeholder="Email" {...this.handleName("email")} />
              <RenderInput
                required
                placeholder="Confirm email"
                {...this.handleName("confirmEmail")}
              />
              <RenderPassword required placeholder="Password" {...this.handleName("password")} />
              <RenderPassword
                required
                placeholder="Confirm password"
                {...this.handleName("confirmPassword")}
              />
              <div className="flex-center">
                <button className="softo-solid-btn" type="submit" disabled={loading}>
                  {loading && <i className="fas fa-circle-notch fa-spin right" />}Sign up
                </button>
              </div>
              {error && <div className="error">{error}</div>}
            </GridForm>
          </Grid>
        </Grid>
      </main>
    );
  }
}
export default SignUpPractice;
