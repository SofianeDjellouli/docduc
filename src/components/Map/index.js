import React, { useState, useEffect, useContext, useCallback, memo } from "react";
import { Checkbox } from "@material-ui/core";
import { Spinner } from "../";
import { loadMap, SearchContext, getCenter, debounce } from "../../utils";
import "./style.css";

const _Map = ({ style }) => {
	const { lat, lng, map, setMap, setParam } = useContext(SearchContext),
		[events, setEvents] = useState([]),
		[toggled, setToggle] = useState(true),
		toggle = useCallback(_ => setToggle(toggled => !toggled), []);

	useEffect(
		_ => {
			if (toggled && !events.length && map)
				setEvents([map.addListener("dragend", debounce(_ => setParam({ ...getCenter(map) })))]);
			else if (!toggled && events.length) {
				events.forEach(e => window.google.maps.event.removeListener(e));
				setEvents([]);
			}
		},
		[map, toggled, events, setParam]
	);

	useEffect(
		_ => {
			if (!map) {
				loadMap().then(_ => {
					const { Map, ControlPosition, event } = window.google.maps,
						map = new Map(document.getElementById("map"), {
							zoom: 12,
							center: { lat, lng },
							disableDefaultUI: true,
							scrollwheel: true,
							scaleControl: true,
							zoomControl: true,
							clickableIcons: false,
							zoomControlOptions: { position: ControlPosition.TOP_LEFT }
						});
					event.addListenerOnce(map, "bounds_changed", _ => setMap(map));
				});
			}
		},
		[setMap, lat, lng, map]
	);

	return (
		<div className="map-wrapper" {...style}>
			{map && (
				<div className="search-move">
					<Checkbox checked={toggled} onChange={toggle} color="primary" />
					<span onClick={toggle}>Search as I move the map</span>
				</div>
			)}
			<div id="map" style={map ? null : { display: "none" }} />
			{!map && Spinner(80)}
		</div>
	);
};

export const Map = memo(_Map);
