import React, { Fragment, useCallback, useState, memo } from "react";
import { post } from "axios";
import { Grid } from "@material-ui/core";
import { navigate } from "hookrouter";
import { useToggle, filter, getSpecialty, handlePromise } from "../../utils";
import { RenderInput, GridForm, RenderAutoClear } from "../";
import { defaultForm, handleSuggestions } from "./utils";
import "./style.css";

const RequestSignUp = _ => {
  const [form, setForm] = useState(defaultForm),
    [APIError, setAPIError] = useState(""),
    toggleSend = useToggle(),
    onChange = useCallback(
      ({ target: { name, value } }) =>
        setForm(form => ({ ...form, [name]: { ...form[name], value, error: "" } })),
      []
    ),
    handleName = useCallback(
      name => ({ onChange, name, className: "form-input", "aria-label": name, ...form[name] }),
      [form, onChange]
    ),
    handlePhone = useCallback(
      ({ target: { value } }) => {
        if (!value || /^[0-9 ]+$/.test(value)) {
          const phone = value.replace(/ /g, "");
          onChange({
            target: {
              name: "phone",
              value:
                phone.length > 3
                  ? `${phone.slice(0, 3)} ${phone.slice(3, 6)}${
                      phone.length > 6 ? " " : ""
                    }${phone.slice(6)}`
                  : phone
            }
          });
        }
      },
      [onChange]
    ),
    handleSpecialty = useCallback(
      ({ value }) => onChange({ target: { name: "practice_specialty", value } }),
      [onChange]
    ),
    filterSpecialty = useCallback(filter([form.practice_specialty.value]), [
      form.practice_specialty.value
    ]),
    handleClear = useCallback(
      _ => onChange({ target: { name: "practice_specialty", value: "" } }),
      [onChange]
    ),
    handleSubmit = useCallback(
      e => {
        e.preventDefault();
        let errors = {};
        const formKeys = Object.keys(form);
        for (let i = 0; i < formKeys.length; i++)
          if (!form[formKeys[i]].value) errors[formKeys[i]] = "This field is required";
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
          let data = { fields: [{ name: "source", value: "Landing" }] };
          for (let i = 0; i < formKeys.length; i++) {
            const key = formKeys[i];
            data.fields.push({ name: key, value: form[key].value });
          }
          handlePromise(
            post(
              "https://api.hsforms.com/submissions/v3/integration/submit/5915194/69a5a7af-d318-4187-884b-1fb72443333e",
              data
            )
              .then(_ => navigate("/thank-you"))
              .catch(setAPIError),
            toggleSend.toggle
          );
        }
      },
      [toggleSend.toggle, form]
    );

  const { value, error } = form.practice_specialty;
  return (
    <Fragment>
      <h3>Join Docduc now, for free.</h3>
      <GridForm onSubmit={handleSubmit}>
        <RenderInput autoFocus placeholder="First name" {...handleName("firstname")} />
        <RenderInput placeholder="Last name" {...handleName("lastname")} />
        <RenderInput placeholder="Email" type="email" {...handleName("email")} />
        <RenderInput
          placeholder="Phone number"
          type="phone"
          {...handleName("phone")}
          onChange={handlePhone}
        />
        <RenderAutoClear
          placeholder="Practice specialty"
          getData={getSpecialty}
          title={value}
          onClear={handleClear}
          handleClick={handleSpecialty}
          // filter={filterSpecialty}
          sm={12}
          {...{ handleSuggestions, error, value }}
        />
        <Grid item className="left-auto">
          <div>* No credit card required</div>
          <div className="justify-end">
            <button type="submit" disabled={toggleSend.toggled} className="softo-solid-btn">
              {toggleSend.toggled && <i className="fas fa-circle-notch fa-spin right" />}
              Get started
            </button>
          </div>
        </Grid>
      </GridForm>
      {APIError && <div className="error">{APIError}</div>}
    </Fragment>
  );
};

export const SignUpRequest = memo(RequestSignUp);
