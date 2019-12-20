import React, { Suspense, useState, useCallback, Fragment, useEffect } from "react";
import { useRoutes } from "hookrouter";
import { MuiPickersUtilsProvider as DatePickerContext } from "@material-ui/pickers";
import utils from "@date-io/moment";
import { Snackbar, Header, fallback } from "./components";
import {
	GlobalContext,
	loadStyle,
	defaultHeaderProps,
	useToggle,
	getId,
	routes as _routes
} from "./utils";
import "./style.css";

const App = _ => {
	const [snackbar, setSnackbar] = useState({}),
		toggleLoad = useToggle(),
		[headerProps, setHeaderProps] = useState(defaultHeaderProps()),
		resetHeader = useCallback(_ => setHeaderProps(defaultHeaderProps()), []),
		closeSnackbar = useCallback(_ => setSnackbar(({ type }) => ({ message: "", type })), []),
		routes = useRoutes(_routes);

	useEffect(
		_ => {
			Promise.all(
				[
					"https://fonts.googleapis.com/icon?family=Material+Icons&display=block",
					"https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700&display=swap"
				].map(loadStyle)
			).then(toggleLoad.toggle);
		},
		[toggleLoad.toggle]
	);

	/*	useEffect(_ => {
		class SubPromise extends Promise {
			constructor(executor) {
				super((resolve, reject) =>
					executor(resolve, err => {
						if (isDev) console.error(err);
						const { response: { data } = {} } = err,
							{ Error, error } = data || {},
							message = (Error || error || data || err).toString() || DEFAULT_ERROR;
						setSnackbar({ message });
						throw message;
					})
				);
			}

			catch(success, reject) {
				return super.catch(success, reject);
			}
		}
		window.Promise = SubPromise;
	}, []);*/

	return toggleLoad.toggled ? (
		<Fragment>
			<Header {...headerProps} key={getId()} />
			<GlobalContext.Provider value={{ setSnackbar, setHeaderProps, resetHeader }}>
				<Suspense {...{ fallback }}>
					<DatePickerContext {...{ utils }}>{routes}</DatePickerContext>
				</Suspense>
			</GlobalContext.Provider>
			<Snackbar {...{ ...snackbar, closeSnackbar }} />
		</Fragment>
	) : (
		fallback
	);
};

export default App;
