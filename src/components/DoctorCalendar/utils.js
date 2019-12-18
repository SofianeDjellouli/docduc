import React from "react";
import { GlobalContext } from "../../utils";

export const RenderModal = Component => props => {
	if (Component)
		return (
			<GlobalContext.Consumer>
				{({ setSnackbar }) => <Component {...{ ...props, setSnackbar }} />}
			</GlobalContext.Consumer>
		);
};

export const handleCalendarLink = _ => {
	document.getElementById("calendar-link").select();
	document.execCommand("copy");
};

export const DOMObserver = new MutationObserver(_ => {
	if (document.querySelector(".rbc-time-content"))
		document.querySelector(".rbc-time-content").scrollTop = 480;
});
