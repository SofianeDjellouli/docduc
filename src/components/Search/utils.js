import React, { Fragment } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { PracticeMap } from "../";
import { handleRating } from "../../utils";

export const handleDoctors = (type, q) => doctors => {
	let result = [];

	for (let i = 0; i < doctors.length; i++) {
		const {
			latitude,
			longitude,
			firstName,
			lastName,
			mainSpecialtyID,
			practice,
			picture,
			gender,
			addressLine1,
			addressLine2,
			aboutDescription,
			ID,
			average_review_score,
			subSpecialtyID,
			spokenLanguage,
			total_review_count,
			out_of_network,
			insurances,
			city,
			state,
			distance
		} = doctors[i];
		let index = addressLine1.indexOf(", "),
			address1 = addressLine1.slice(0, index),
			address2 = addressLine1.slice(index + 2),
			fullAddress = `${address1} ${addressLine2}, ${address2}`,
			specialties = [mainSpecialtyID, ...(subSpecialtyID ? subSpecialtyID.split(",") : [])],
			mainSpecialty = type === "specialty" ? q : mainSpecialtyID,
			name = `Dr. ${firstName} ${lastName}`,
			languages = spokenLanguage && spokenLanguage.split(",").map(e => <div key={e}>{e}</div>),
			rate = (
				<Fragment>
					{Boolean(average_review_score) && Number(average_review_score.toFixed(1))}{" "}
					{handleRating(average_review_score)} ({total_review_count})
				</Fragment>
			);

		result.push({
			fullAddress,
			inCareTeam: false,
			name,
			city,
			state,
			mainSpecialty,
			practice,
			picture: picture || `/img/doctor${gender}.svg`,
			address1,
			address2,
			aboutDescription,
			lat: parseFloat(latitude),
			lng: parseFloat(longitude),
			ID,
			rate,
			specialties,
			languages,
			insurances:
				insurances && insurances.map(({ name, plan, ID }) => ({ label: `${name} - ${plan}`, ID })),
			type,
			separator: "",
			gender,
			out_of_network,
			distance: distance
				? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: "0" }).format(distance)} mi`
				: null,
			reviews: [],
			reviewsDone: false
		});
	}
	return result;
};

export const handleInsurance = doctors => {
	let data = [...doctors];
	for (let i = 0; i < data.length; i++) {
		let outOfNetwork = data[i].out_of_network,
			first = i === 0;
		if (
			!outOfNetwork &&
			(first || (i && data[i - 1].out_of_network)) &&
			data[i].separator.indexOf("network providers") < 0
		)
			data[i].separator = data[i].separator +=
				'<i class="fas fa-check-circle"></i>In network providers';
		else if (
			outOfNetwork &&
			(first || (i && !data[i - 1].out_of_network)) &&
			data[i].separator.indexOf("network providers") < 0
		)
			data[i].separator = data[i].separator +=
				'<i class="fas fa-exclamation-circle"></i>Out of network providers';
	}
	return data;
};

export const handleMarkers = ({ doctors, ...args }) => {
	let offices = [];

	for (let i = 0; i < doctors.length; i++) {
		const { lat, lng, ID } = doctors[i];

		let office = [];
		loop: for (let j = i; j < doctors.length; j++) {
			for (let l = 0; l < offices.length; l++) if (offices[l] === ID) break loop;
			if (lat === doctors[j].lat && lng === doctors[j].lng) {
				const { name, mainSpecialty, practice, fullAddress, rate, ID } = doctors[j];
				office.push({ name, mainSpecialty, practice, fullAddress, rate, ID, j });
			}
		}

		if (office.length) {
			let marker = createHTMLMapMarker({ lat, lng, office, ...args });
			for (let j = 0; j < office.length; j++) {
				offices.push(office[j].ID);
				doctors[office[j].j].marker = marker;
			}
		}
	}

	return doctors;
};
export const createHTMLMapMarker = ({ lat, lng, map, ...props }) => {
	const { OverlayView, LatLng } = window.google.maps,
		coords = new LatLng({ lat, lng });
	class HTMLMapMarker extends OverlayView {
		constructor() {
			super();
			this.setMap(map);
		}

		panTo() {
			map.panTo(coords);
			map.panBy(0, -100);
		}

		open(openID) {
			if (this.wrapper) {
				unmountComponentAtNode(this.wrapper);
				render(<PracticeMap panTo={this.panTo} {...{ ...props, openID }} />, this.wrapper);
				this.panTo();
			}
		}

		draw() {
			if (!this.wrapper) {
				this.wrapper = document.createElement("div");
				this.wrapper.style.position = "absolute";
				render(<PracticeMap panTo={this.panTo} {...props} />, this.wrapper);
				this.getPanes().floatPane.appendChild(this.wrapper);
			}
			const { x, y } = this.getProjection().fromLatLngToDivPixel(coords) || {};
			if (x) {
				this.wrapper.style.left = `${x - 15}px`;
				this.wrapper.style.top = `${y - 40}px`;
			}
		}

		onRemove() {
			if (this.wrapper) {
				unmountComponentAtNode(this.wrapper);
				this.wrapper.parentNode.removeChild(this.wrapper);
				this.wrapper = null;
			}
		}
	}
	return new HTMLMapMarker();
};
export const handleTeamDoctors = (doctors, careTeam) => {
	for (let i = 0; i < doctors.length; i++)
		for (let j = 0; j < careTeam.length; j++)
			if (careTeam[j].ID === doctors[i].ID) {
				doctors[i].inCareTeam = true;
				break;
			}
	return doctors;
};

export const ADD_PAGE = "ADD_PAGE";
export const EXTENDED = "EXTENDED";
