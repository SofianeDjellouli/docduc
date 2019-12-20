import React, { Fragment, useCallback, useState, useEffect, useContext } from "react";
import { Input } from "@material-ui/core";
import { useToggle, handlePromise, handleLogin, baseRequest, GlobalContext } from "../../utils";
import { ModalSignUp, ForgotPassword, ResetPassword, Footer } from "../";
import { defaultForm } from "./utils";
import "./style.css";

const SignIn = _ => {
  const { setSnackbar } = useContext(GlobalContext),
    [form, setForm] = useState(defaultForm),
    [error, setError] = useState(""),
    toggleSignUp = useToggle(),
    toggleForgot = useToggle(),
    toggleReset = useToggle(),
    toggleLoading = useToggle(),
    onChange = useCallback(
      ({ target: { name, value } }) => setForm(form => ({ ...form, [name]: { value } })),
      []
    ),
    field = useCallback(
      name => {
        const { error, value } = form[name];
        return (
          <Fragment>
            <Input
              {...{ onChange, name, value }}
              type={name}
              placeholder={`${name.slice(0, 1).toUpperCase()}${name.slice(1)}`}
              error={Boolean(error)}
              fullWidth
            />
            {error && <div className="error">{error}</div>}
          </Fragment>
        );
      },
      [form, onChange]
    ),
    handleSignIn = useCallback(
      e => {
        e.preventDefault();
        let errors = { ...form };
        ["email", "password"].forEach(e => {
          if (!form[e].value) errors[e] = { ...form[e], error: "This field is required." };
        });
        const errorsKeys = Object.keys(errors);
        for (let i = 0; i < errorsKeys.length; i++)
          if (errors[errorsKeys[i]].error) return setForm(errors);
        const { email, password } = form;
        return handlePromise(
          baseRequest
            .post("login", { email: email.value, password: password.value })
            .then(handleLogin)
            .catch(setError),
          toggleLoading.toggle
        );
      },
      [form, toggleLoading.toggle]
    );

  useEffect(
    _ => {
      if (window.location.search && !toggleReset.toggled) toggleReset.toggle();
    },
    [toggleReset]
  );
  return (
    <main className="sign-in">
      <div className="container">
        <div className="sign-in-box">
          <div className="sign-in-box-header">Sign in</div>
          <form onSubmit={handleSignIn}>
            {field("email")}
            {field("password")}
            <div className="flex-center">
              <button type="submit" className="softo-solid-btn" disabled={toggleLoading.toggled}>
                {toggleLoading.toggled && <i className="fas fa-circle-notch fa-spin right" />}
                Sign in
              </button>
            </div>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
        <div className="links">
          <div>
            Don't have an account?{" "}
            <button onClick={toggleSignUp.toggle} className="link-button">
              Sign up
            </button>
          </div>
          <div>
            <button onClick={toggleForgot.toggle} className="link-button">
              I forgot my password
            </button>
          </div>
        </div>
      </div>
      <Footer />
      <ModalSignUp open={toggleSignUp.toggled} onClose={toggleSignUp.toggle} />
      <ResetPassword open={toggleReset.toggled} onClose={toggleReset.toggle} {...{ setSnackbar }} />
      <ForgotPassword
        open={toggleForgot.toggled}
        onClose={toggleForgot.toggle}
        {...{ setSnackbar }}
      />
    </main>
  );
};

export default SignIn;
