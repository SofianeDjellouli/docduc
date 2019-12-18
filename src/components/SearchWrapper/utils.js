import React, { useCallback, useContext, useState, memo } from "react";
import { Radio, FormControlLabel } from "@material-ui/core";
import { getPlaces, geocode, SearchContext, handlePromise, useToggle } from "../../utils";
import { Filter, Autocomplete, Tooltip } from "../";

const classes = { label: "custom-label" };

export const CustomControl = value => (
	<FormControlLabel
		key={value}
		label={value}
		control={<Radio color="primary" />}
		{...{ value, classes }}
	/>
);

const handleClickFilter = ({ value, setParam, param }) => setParam({ [param]: value });

export const FilterAutocomplete = ({ placeholder, title, param, ...props }) => {
	const commonProps = { placeholder, param, title };
	return (
		<Filter {...commonProps}>
			<Autocomplete autoFocus handleClick={handleClickFilter} {...{ ...commonProps, ...props }} />
		</Filter>
	);
};

const _AutocompletePlace = _ => {
	const { setParam, setSnackbar } = useContext(SearchContext),
		[location, setLocation] = useState(_ => {
			let _location = localStorage.location;
			if (_location) {
				localStorage.removeItem("location");
				return _location;
			}
			return "";
		}),
		{ toggle, toggled } = useToggle(),
		handlePlace = useCallback(
			({ value }) => geocode(value).then(({ lat, lng }) => setParam({ lat, lng })),
			[setParam]
		),
		handleLocation = useCallback(
			_ => {
				if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
					setLocation("");
					handlePromise(
						new Promise((resolve, reject) =>
							navigator.geolocation.getCurrentPosition(
								({ coords: { latitude, longitude } }) => {
									let location = { lat: latitude, lng: longitude };
									setParam(location);
									return resolve(location);
								},
								({ code }) =>
									reject(
										code === 1
											? {
													response:
														"Please allow geolocation in your browser's options. It can be reached by clicking on the padlock at the left of the website address."
											  }
											: null
									)
							)
						).then(location => {
							const { Geocoder, GeocoderStatus } = window.google.maps;
							return new Geocoder().geocode({ location }, (results, status) => {
								if (status === GeocoderStatus.OK) setLocation(results[0].formatted_address);
								else Promise.reject(status);
							});
						}),
						toggle
					);
				} else setSnackbar("We haven't been able to track your location.");
			},
			[toggle, setParam, setSnackbar]
		);
	return (
		<div>
			<i className="fas fa-map-marker-alt" />
			<Autocomplete
				placeholder="Where?"
				getData={getPlaces}
				title={location}
				handleClick={handlePlace}
			/>
			{toggled ? (
				<i className="fas fa-circle-notch fa-spin" />
			) : (
				<Tooltip
					title="My location"
					children={<i onClick={handleLocation} className="fas fa-location-arrow right" />}
				/>
			)}
		</div>
	);
};

export const AutocompletePlace = memo(_AutocompletePlace);
