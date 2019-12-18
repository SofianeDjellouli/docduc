import React, { useEffect, useState, Fragment } from "react";
import { get } from "axios";
import { useQueryParams, A } from "hookrouter";
import { Spinner } from "../";
import { baseRequest, handlePromise, useToggle } from "../../utils";

const Verify = _ => {
	const [{ token }] = useQueryParams(),
		[error, setError] = useState(""),
		toggleLoading = useToggle();
	useEffect(
		_ => {
			if (token)
				handlePromise(
					get("https://api.ipify.org").then(({ data }) =>
						baseRequest.post("verify_email", {
							user_agent: navigator.userAgent,
							ip_address: data,
							token
						})
					),
					/*.catch(setError)*/ toggleLoading.toggle
				);
			else setError("Access not allowed");
		},
		[token, toggleLoading.toggle]
	);
	return (
		<main>
			{toggleLoading.toggled ? (
				Spinner()
			) : error ? (
				<div className="error align-center">{error}</div>
			) : (
				<Fragment>
					<div className="main-title">Email verification successful!</div>
					<div className="main-subtitle">
						Welcome to Docduc! You may now <A href="/sign-in">sign in</A> using your account
						credentials.
					</div>
				</Fragment>
			)}
		</main>
	);
};

export default Verify;
