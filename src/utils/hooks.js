import { useState, useCallback, useEffect } from "react";
import { useMediaQuery } from "@material-ui/core";
import { debounce } from "./";

export const useToggle = (bool = false) => {
	const [toggled, setToggled] = useState(bool);
	const toggle = useCallback(_ => setToggled(toggled => !toggled), []);
	return { toggled, toggle };
};

export const useScroll = (ref, getData, stop, top = 0) => {
	const [events, setEvents] = useState([]), // for uncontrolled events
		getEvents = useCallback(
			_ =>
				getData().then(data => {
					if (data) setEvents(events => [...events, ...data]);
				}),
			[getData]
		);

	useEffect(
		_ => {
			getEvents();
		},
		[getEvents]
	);

	return {
		events,
		setEvents,
		onScroll: useCallback(
			debounce(_ => {
				const { current } = ref,
					{ scrollTop, scrollHeight } = current || {};
				if (scrollHeight - scrollTop - top < 2000 && !stop) getEvents();
			}),
			[stop]
		)
	};
};

export const useMobile = _ => useMediaQuery("(max-width:768px)");
