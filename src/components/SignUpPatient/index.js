import React, { Fragment, useCallback, useState, memo } from "react";
import { Grid, FormHelperText } from "@material-ui/core";
import { DatePicker } from "@material-ui/pickers";
import { navigate, A } from "hookrouter";
import { RenderInput, RenderPassword, RenderRadio, GridForm } from "../";
import { useToggle, baseRequest, handlePromise } from "../../utils";
import { defaultForm, genders } from "./utils";
import "./style.css";

const _SignUpPatient = _ => {
  const [form, setForm] = useState(defaultForm),
    [APIError, setAPIError] = useState(""),
    toggleSend = useToggle(),
    onChange = useCallback(
      ({ target: { name, value } }) =>
        setForm(form => ({ ...form, [name]: { ...form[name], value, error: "" } })),
      []
    ),
    handleDOB = useCallback(value => onChange({ target: { name: "DOB", value } }), [onChange]),
    handleName = useCallback(
      name => ({ onChange, name, className: "form-input", "aria-label": name, ...form[name] }),
      [form, onChange]
    ),
    handleSubmit = useCallback(
      e => {
        e.preventDefault();
        let errors = {};
        const formKeys = Object.keys(form);
        for (let i = 0; i < formKeys.length; i++)
          if (!form[formKeys[i]].value) errors[formKeys[i]] = "This field is required";
        const { password, confirmPassword, email, confirmEmail } = form;
        if (password.value !== confirmPassword.value) {
          errors.confirmPassword = "Passwords must match.";
          errors.password = "Passwords must match.";
        }
        if (email.value !== confirmEmail.value) {
          errors.confirmEmail = "Emails must match.";
          errors.email = "Emails must match.";
        }
        const errorKeys = Object.keys(errors);
        if (errorKeys.length)
          setForm(form => {
            let _form = {};
            for (let i = 0; i < errorKeys.length; i++) {
              const field = errorKeys[i];
              _form[field] = { ...form[field], error: errors[field] };
            }
            return { ...form, ..._form };
          });
        else {
          const { confirmPassword, confirmEmail, DOB, ...data } = form;
          for (let i = 0; i < formKeys.length; i++) {
            const key = formKeys[i];
            if (data[key]) data[key] = form[key].value;
          }
          data.DOB = DOB.value.toJSON().slice(0, 10);

          handlePromise(
            baseRequest
              .post("signup_patient", data)
              .then(_ => navigate("/thank-you"))
              .catch(setAPIError),
            toggleSend.toggle
          );
        }
      },
      [toggleSend.toggle, form]
    );

  const { value, error } = form.DOB;

  return (
    <Fragment>
      <GridForm onSubmit={handleSubmit}>
        <RenderInput placeholder="First name" {...handleName("firstName")} />
        <RenderInput placeholder="Last name" {...handleName("lastName")} />
        <RenderRadio control={genders} {...handleName("gender")} />
        <Grid item xs={12} sm={6}>
          <DatePicker
            fullWidth
            openTo="year"
            format="DD/MM/YYYY"
            emptyLabel="Date of birth"
            views={["year", "month", "date"]}
            disableFuture
            {...{ value }}
            onChange={handleDOB}
            inputProps={{ "aria-label": "Date of birth", className: "form-input" }}
            InputProps={{
              disableUnderline: true,
              ...(!value && { style: { color: "gray" } })
            }}
          />
          {!!error && <FormHelperText error>{error}</FormHelperText>}
        </Grid>
        <RenderInput placeholder="Email" type="email" {...handleName("email")} />
        <RenderInput placeholder="Confirm email" type="email" {...handleName("confirmEmail")} />
        <RenderPassword placeholder="Password" {...handleName("password")} />
        <RenderPassword placeholder="Confirm password" {...handleName("confirmPassword")} />
        <Grid item className="left-auto">
          <A href="/sign-up-doctor" target="_blank">
            Join as a doctor?
          </A>
          <button type="submit" disabled={toggleSend.toggled} className="softo-solid-btn">
            {toggleSend.toggled && <i className="fas fa-circle-notch fa-spin right" />}
            Get started
          </button>
        </Grid>
      </GridForm>
      {APIError && <div className="error">{APIError}</div>}
    </Fragment>
  );
};

export const SignUpPatient = memo(_SignUpPatient);
