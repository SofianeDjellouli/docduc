import React, { Fragment } from "react";
import { debounce, searchRequest, baseRequest, loadMap } from "./";

export const getSymptoms = debounce(value =>
	searchRequest
		.get(`symptom?q=${value}`)
		.then(({ data }) => data.map(({ name, symptom_id }) => ({ value: name, id: symptom_id })))
);

let languages = [];
export const getLanguages = value => {
	const handleLanguages = a =>
		a.filter(e => e.value.toLowerCase().indexOf(value.toLowerCase()) > -1).slice(0, 5);
	return languages.length
		? Promise.resolve(handleLanguages(languages))
		: baseRequest.get("lookup/types/language").then(({ data }) => {
				languages = data.map(e => ({ value: e.dataValue }));
				return handleLanguages(languages);
		  });
};

export const getPlaces = debounce(value =>
	loadMap().then(
		_ =>
			new Promise((resolve, reject) => {
				const { AutocompleteService, PlacesServiceStatus } = window.google.maps.places;
				return new AutocompleteService().getPlacePredictions({ input: value }, (res, status) => {
					if (status === PlacesServiceStatus.OK) {
						if (res && res.length) resolve(res.map(e => ({ value: e.description })));
						else resolve([]);
					} else reject(status);
				});
			})
	)
);

export const getSpecialtyOrName = debounce(value =>
	Promise.all(
		["doctor?type=name&d=25000mi&", "specialty?"].map(e => searchRequest.get(`${e}q=${value}`))
	).then(res => {
		const concatedRes = [].concat.apply([], res.map(e => e.data));
		if (concatedRes.length)
			return [].concat.apply(
				[],
				res.map(({ data }, i) => {
					switch (i) {
						case 0:
							return [
								...data.map(
									({ firstName, lastName, picture, mainSpecialty, city, state, gender }) => ({
										picture:
											picture ||
											`img/doctor${gender.slice(0, 1).toUpperCase()}${gender.slice(1)}.svg`,
										mainSpecialty,
										city,
										state,
										value: `Dr. ${firstName} ${lastName}`,
										type: "Doctors"
									})
								)
							];
						case 1:
							return [
								...data.map(({ specialty, description }) => ({
									value: specialty,
									type: "Specialties",
									description: description.slice(0, 1).toUpperCase() + description.slice(1)
								}))
							];
						default:
							break;
					}
					return [];
				})
			);
		return [];
	})
);

export const getSpecialty = debounce(value =>
	searchRequest.get(`specialty?q=${value}`).then(({ data }) =>
		data.map(({ specialty, description }) => ({
			value: specialty,
			type: "Specialties",
			description: description.slice(0, 1).toUpperCase() + description.slice(1)
		}))
	)
);

//for modal insurance
export const _getInsurances = debounce(value =>
	searchRequest
		.get(`insurance?q=${value}`)
		.then(({ data }) =>
			data.map(({ ID, plan }) => ({ ID, plan: plan.split(" - ")[1], name: plan.split(" - ")[0] }))
		)
);

//for patient profile
export const getInsurances = debounce(value =>
	searchRequest
		.get(`insurance?q=${value}`)
		.then(({ data }) => data.map(({ ID, plan }) => ({ id: ID, value: plan })))
);

const mapDoctors = ({
	firstName,
	lastName,
	login_id,
	picture,
	mainSpecialtyID,
	city,
	state,
	gender
}) => ({
	picture: picture || `/img/doctor${gender.slice(0, 1).toUpperCase()}${gender.slice(1)}.svg`,
	mainSpecialtyID,
	city,
	state,
	login_id,
	value: `Dr. ${firstName} ${lastName}`,
	type: "Doctors"
});

const mapIdName = ({ data }) => data.map(({ id, name }) => ({ id, value: name }));

export const getProcedures = debounce(value =>
	searchRequest.get(`procedure?q=${value}`).then(mapIdName)
);
export const getMedications = debounce(value =>
	searchRequest.get(`medication?q=${value}`).then(mapIdName)
);
export const getConditions = debounce(value =>
	searchRequest.get(`condition?q=${value}`).then(mapIdName)
);

export const getDoctors = debounce(value =>
	searchRequest
		.get(`doctor?type=name&d=25000mi&&q=${value}`)
		.then(({ data }) => data.map(mapDoctors))
);

export const handleClickMain = ({ value, setValue, setParam, id, type }) => {
	switch (type) {
		case "Symptoms":
		case "Conditions":
			return (type === "Symptoms"
				? searchRequest.get(`triage?symptoms=${id}`)
				: Promise.resolve({ data: [{ condition_id: id }] })
			)
				.then(({ data }) => {
					if (data.length)
						return searchRequest.get(`triage_specialty?conditions=${data[0].condition_id}`);
				})
				.then(({ data }) => {
					if (data.length) setParam({ q: data[0].name, type: "specialty" });
				});
		case "Doctors":
			let doctorName = value.slice(4);
			setValue(doctorName);
			setParam({ q: doctorName, type: "name" });
			break;
		case "Specialties":
			setParam({ q: value, type: "specialty" });
			break;
		default:
			break;
	}
};
export const handleClick = ({ value, setParam, param }) => {
	if (setParam) setParam({ [param]: value });
};

const style = { background: "lightgray" };

export const handleSpecialtiesSuggestions = (onClick, onMouseMove, node, suggestions) => (
	{ value, id, description },
	i
) => (
	<div
		className="suggestion"
		data-value={value}
		data-i={i}
		key={value + i}
		{...{ onClick, onMouseMove, ...(node && value === node.dataset.value && { style }) }}>
		<div className="suggestion-wrapper">
			<div className="suggestion-title">{value}</div>
			<div className="suggestion-subtitle">{description}</div>
		</div>
	</div>
);

export const getSearch = debounce(value =>
	Promise.all(
		["doctor?type=name&", "specialty?", "condition?", "symptom?"].map(e =>
			searchRequest.get(`${e}q=${value}`)
		)
	).then(res => {
		const concatedRes = [].concat.apply([], res.map(e => e.data));
		if (concatedRes.length)
			return [].concat.apply(
				[],
				res.map(({ data }, i) => {
					switch (i) {
						case 0:
							return [...data.map(mapDoctors)];
						case 1:
							return [
								...data.map(({ specialty, description }) => ({
									value: specialty,
									type: "Specialties",
									description: description.slice(0, 1).toUpperCase() + description.slice(1)
								}))
							];
						case 2:
							return [...data.map(({ name, id }) => ({ value: name, type: "Conditions", id }))];
						case 3:
							return [
								...data.map(({ name, symptom_id }) => ({
									value: name,
									type: "Symptoms",
									id: symptom_id
								}))
							];
						default:
							break;
					}
					return [];
				})
			);
		return [];
	})
);

export const handleSearchSuggestions = (onClick, onMouseMove, node, suggestions) => (
	{ value, type, id, picture, mainSpecialty, city, state, description },
	i
) => {
	let isNewCategory = i === 0 || type !== suggestions[i - 1].type,
		special = ["Doctors", "Specialties"].includes(type),
		isDoctor = type === "Doctors";
	return (
		<Fragment key={value + i}>
			{isNewCategory && <div className="type">{type}</div>}
			<div
				className={`suggestion ${special ? "flex" : ""}`}
				{...{
					onClick,
					onMouseMove,
					"data-value": value,
					"data-type": type,
					"data-i": i,
					...(id && { "data-id": id }),
					...(node && value === node.dataset.value && i.toString() === node.dataset.i && { style })
				}}>
				{special ? (
					<Fragment>
						{isDoctor && <img src={picture} height="60" width="60" alt={value} />}
						<div className="suggestion-wrapper">
							<div className="suggestion-title">{value}</div>
							<div className="suggestion-subtitle">
								{isDoctor ? `${city}, ${state}` : description}
							</div>
						</div>
					</Fragment>
				) : (
					value
				)}
			</div>
		</Fragment>
	);
};

export const handleDoctorsSuggestions = (onClick, onMouseMove, node, suggestions) => (
	{ value, picture, city, state, ...doctor },
	i
) => (
	<div
		key={value + i}
		className="suggestion flex"
		data-value={value}
		data-i={i}
		data-doctor={JSON.stringify({ value, picture, city, state, ...doctor })}
		{...{
			onClick,
			onMouseMove,
			...(node && value === node.dataset.value && i.toString() === node.dataset.i && { style })
		}}>
		<img src={picture} height="60" width="60" alt={value} />
		<div className="suggestion-wrapper">
			<div className="suggestion-title">{value}</div>
			<div className="suggestion-subtitle">{`${city}, ${state}`}</div>
		</div>
	</div>
);
