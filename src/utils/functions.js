import React, { createContext, Fragment } from "react";
import { MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { navigate } from "hookrouter";
import moment from "moment";
import { CardElement } from "react-stripe-elements";
import branch from "branch-sdk";
import { MAP_KEY, authRequest, DEFAULT_ERROR, BRANCH_KEY, ONE_SIGNAL_KEY } from "./";

const handleAuth = token => ({ headers: { authorization: localStorage[token] } });
export const getAuth = _ => handleAuth("token");
export const getPracticeAuth = _ => handleAuth("practiceToken");
export const getEmail = _ => localStorage.email;
export const getType = _ => localStorage.userType;
export const getId = _ => (localStorage.ID ? parseInt(localStorage.ID) : null);
export const getLoginId = _ => (localStorage.login_id ? parseInt(localStorage.login_id) : null);
export const getUuid = _ => localStorage.uuid;
export const getPubnubToken = _ => localStorage.pub_nub_auth_token;
export const getGender = _ => localStorage.gender;
export const getName = _ => localStorage.name;
export const getPicture = _ => localStorage.picture;

export const isDoctor = _ => getType() === "1";
export const isPatient = _ => getType() === "6";
export const isPractice = _ => getType() === "7";
export const isAdmin = !!localStorage.adminToken;
export const isSuperAdmin = !!localStorage.isSuperAdmin;

export const GlobalContext = createContext({});
export const PatientCalendarContext = createContext({});

export const loadStyle = e =>
	new Promise((resolve, reject) => {
		if (document.querySelector(`[href="${e}"]`)) resolve();
		else {
			let script = document.createElement("link");
			script.setAttribute("href", e);
			script.setAttribute("rel", "stylesheet");
			window.document.head.appendChild(script);
			script.addEventListener("load", resolve);
			script.addEventListener("error", reject);
		}
	});

export const loadScript = (src, condition) =>
	new Promise((resolve, reject) => {
		if (condition) resolve();
		else {
			const script = document.createElement("script");
			script.src = src;
			script.async = true;
			script.defer = true;
			window.document.body.appendChild(script);
			script.addEventListener("load", resolve);
			script.addEventListener("error", reject);
		}
	});

export const loadMap = _ =>
	loadScript(
		`https://maps.googleapis.com/maps/api/js?key=${MAP_KEY}&libraries=places,geometry`,
		window.google && window.google.maps
	);

export const geocode = address =>
	loadMap().then(
		_ =>
			new Promise((resolve, reject) => {
				const { Geocoder, GeocoderStatus } = window.google.maps;
				return new Geocoder().geocode(
					{ address },
					([{ geometry, address_components, formatted_address }], status) => {
						if (status === GeocoderStatus.OK) {
							let result = { addressLine1: formatted_address, ...geometry.location.toJSON() };
							for (let i = 0; i < address_components.length; i++) {
								const { types, long_name } = address_components[i];
								for (let j = 0; j < types.length; j++)
									switch (types[j]) {
										case "locality":
											result.city = long_name;
											break;
										case "administrative_area_level_1":
											result.state = long_name;
											break;
										case "postal_code":
											result.zip = long_name;
											break;
										default:
											break;
									}
							}
							resolve(result);
						} else reject(status);
					}
				);
			})
	);

export const handleLocalData = ({
	email,
	token,
	userType,
	uuid,
	user_profileid,
	pub_nub_auth_token,
	doctor_profile,
	patient_profile,
	practice_profile,
	...data
}) => {
	if ([8, 9].includes(userType)) {
		localStorage.setItem("adminToken", token);
		if (userType === 9) localStorage.setItem("isSuperAdmin", "true");
		navigate("/admin");
	}
	const { gender, firstName, lastName, name, picture, image_url, addressLine1, login_id, ID } =
			doctor_profile || patient_profile || practice_profile || {},
		image = practice_profile ? "/img/doctorMale.svg" : data.picture || picture || image_url;
	localStorage.setItem("email", email);
	localStorage.setItem(practice_profile ? "practiceToken" : "token", token);
	localStorage.setItem("userType", userType);
	localStorage.setItem("ID", ID);
	localStorage.setItem("login_id", login_id);
	localStorage.setItem("uuid", uuid);
	localStorage.setItem("pub_nub_auth_token", pub_nub_auth_token);
	localStorage.setItem("name", name || `${firstName} ${lastName}`);
	if (addressLine1) localStorage.setItem("location", addressLine1);
	if (image) localStorage.setItem("picture", image);
	if ([1, 6].includes(userType)) {
		localStorage.setItem("gender", gender);
		handleNotifications();
	}
};

export const handleLogin = ({ data } = {}) => {
	handleLocalData(data);
	const { userType, location } = localStorage;
	switch (userType) {
		case "1":
			navigate("/calendar");
			break;
		case "6":
			return Promise.resolve(
				location
					? geocode(location).then(coords => {
							for (var i in coords) localStorage.setItem(i, coords[i]);
					  })
					: null
			)
				.then(_ => {
					const { nameToAdd } = localStorage;
					if (nameToAdd) navigate(`/search?q=${nameToAdd.slice(4)}&type=name`);
					return authRequest("patients/favorites").get("/list");
				})
				.then(({ data }) => navigate(`/search${data.length ? "/my-care-team" : ""}`));
		case "7":
			navigate("/practice/calendar");
			break;
		default:
			break;
	}
};

export const debounce = func => {
	var timeout = null;
	return (...args) => {
		clearTimeout(timeout);
		return new Promise(resolve => (timeout = setTimeout(() => resolve(func(...args)), 250)));
	};
};

export const handlePromise = (promise, setLoading) => {
	if (setLoading) setLoading(true);
	window.document.body.style.cursor = "progress";
	return promise.then(e => {
		if (setLoading) setLoading(false);
		window.document.body.style.cursor = "";
		return e;
	});
};

export const getFullDate = a =>
	a.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export const now = new Date();

export const focusInputRef = ref => {
	if (ref.current) {
		const { current } = ref;
		current.focus();
		if (typeof current.selectionStart === "number")
			current.selectionStart = current.selectionEnd = current.value.length;
		else if (typeof current.createTextRange !== "undefined") {
			let range = current.createTextRange();
			range.collapse(false);
			range.select();
		}
	}
};

export const handleRating = rate => {
	let i = 0,
		j = 0,
		array = [];
	while (j < 5) {
		while (i < rate) {
			array.push(
				<i
					key={j}
					className={`fas fa-star${(parseInt(rate) !== rate && i + 1) > rate ? "-half-alt" : ""}`}
				/>
			);
			j++;
			i++;
			if (j === 5) break;
		}
		if (j === 5) break;
		array.push(<i key={j} className="far fa-star" />);
		j++;
	}
	return array;
};

export const handleSignOut = _ => {
	localStorage.clear();
	navigate("/");
};

export const formatPrice = price =>
	new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price / 100);

export const getTop = a => a.getBoundingClientRect().top;

export const handleFile = event =>
	new Promise((resolve, reject) => {
		event.preventDefault();
		let data = event.dataTransfer ? [...event.dataTransfer.files] : [...event.target.files];
		event.target.value = null;
		if (data && data.length) {
			let promises = [];
			for (let i = 0; i < data.length; i++) {
				let { name, type, size } = data[i];
				if (size > 10000000) return reject("A single file can't be larger than 10 Mb.");
				else if (!["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(type))
					return reject("Files must be of type pdf, png, jpg or jpeg.");
				else {
					let reader = new FileReader();
					promises.push(
						new Promise(resolve => (reader.onloadend = _ => resolve({ name, file: reader.result })))
					);
					reader.readAsDataURL(data[i]);
				}
			}
			Promise.all(promises).then(resolve);
		}
	});

export const handleRemove = array => i => {
	let _array = [...array];
	_array.splice(i, 1);
	return _array;
};

export const filter = array => ({ value }) => {
	for (let i = 0; i < array.length; i++) if (array[i] === value) return false;
	return true;
};

export const handleError = doSomething => ({ response: { data = {} } = {} } = {}) => {
	const { Error, error } = data,
		err = Error || error || data;
	return doSomething(typeof err === "string" ? err : DEFAULT_ERROR);
};

export const getPosition = _ =>
	new Promise((resolve, reject) =>
		navigator.geolocation.getCurrentPosition(
			({ coords: { latitude, longitude } }) => resolve({ lat: latitude, lng: longitude }),
			({ code }) =>
				reject(
					code === 1
						? "Please allow geolocation in your browser's options. It can be reached by clicking on the padlock at the left of the website address."
						: null
				)
		)
	);

export const handleHome = _ =>
	["/", "/patient", "/doctor"].includes(window.location.pathname)
		? window.scrollTo({ top: 0, behavior: "smooth" })
		: navigate("/");

export const sortBy = prop => array =>
	array.sort((a, b) => (a[prop] > b[prop] ? 1 : b[prop] > a[prop] ? -1 : 0));

export const sortByName = sortBy("name");

export const sortByPlan = sortBy("plan");

export const isAll = a => a.plan === "All";

export const allOnTop = array => {
	let allPlans = [],
		i = array.length,
		_array = [...array];
	while (i--)
		if (isAll(_array[i])) {
			allPlans.push(_array[i]);
			_array.splice(i, 1);
		}
	return [...allPlans, ..._array];
};

export const handleMenuList = ({ title, i, onClick }) => (
	<MenuItem key={title} {...{ onClick }}>
		<ListItemIcon>{i}</ListItemIcon>
		<ListItemText primary={title} />
	</MenuItem>
);

export const defaultHeaderProps = _ => ({
	iconButtons: [
		...(getType()
			? [
					{ title: "Calendar", i: <i className="material-icons">calendar_today</i> },
					{ title: "Chat", i: <i className="fas fa-comment-alt" /> }
			  ]
			: []),
		...(!isDoctor && !isPractice ? [{ title: "Chatbot", i: <i className="fas fa-robot" /> }] : [])
	],
	solidButtons: [{ onClick: _ => navigate("/sign-in"), title: "Sign in" }],
	menuList: [
		{
			onClick: _ => navigate("/settings/profile"),
			title: "Profile",
			i: <i className="fas fa-user" />
		},
		{
			onClick: _ => navigate("/settings/credentials"),
			title: "Settings",
			i: <i className="fas fa-sliders-h" />
		},
		{
			title: "Sign out",
			i: <i className="fas fa-sign-out-alt" />,
			onClick: handleSignOut
		}
	].map(handleMenuList)
});

export const Card = _ => (
	<fieldset>
		<label>
			<span>Card</span>
			<CardElement className="field" hidePostalCode={true} />
		</label>
	</fieldset>
);

export const formatDate = date => moment(date).format("MM/DD/YYYY");

export const handleClassPromise = (promise, setLoading) => {
	window.document.body.style.cursor = "progress";
	return setLoading(true)
		.then(promise)
		.then(e => {
			if (setLoading) setLoading(false);
			window.document.body.style.cursor = "";
			return e;
		});
};

export const getCenter = map => new window.google.maps.LatLng(map.getCenter().toJSON()).toJSON();

export const handleFromTo = (from, to) => {
	let nowOrMidnight = date => a =>
			date.toDateString() === new Date().toDateString() ? new Date()[a]() : 0,
		parseDate = a =>
			a
				.toJSON()
				.replace("T", " ")
				.slice(0, 16),
		setFrom = nowOrMidnight(from);
	from.setHours(setFrom("getHours"));
	from.setMinutes(setFrom("getMinutes"));
	to.setHours(23);
	to.setMinutes(59);
	return { from: parseDate(from), to: parseDate(to) };
};

export const Title = a => (
	<Fragment>
		<h2>{a}</h2>
		<hr />
	</Fragment>
);

export const hasSpecialChars = a =>
	a && !/^[\u{00C0}-\u{01FF}a-zA-Z'-.\s]+((\s)+[\u{00C0}-\u{01FF}a-zA-Z'-.\s]+)*$/u.test(a);

export const notFirstCap = a =>
	a && (a.slice(0, 1) !== a.slice(0, 1).toUpperCase() || a.slice(1) !== a.slice(1).toLowerCase());

// export const isPromise = a => typeof a === "object" && a !== null && a.then;

export const initBranch = _ => {
	if (!window.branch) branch.init(BRANCH_KEY);
};

export function handleNotifications() {
	loadScript("https://cdn.onesignal.com/sdks/OneSignalSDK.js", window.OneSignal).then(_ => {
		let OneSignal = window.OneSignal || [];
		OneSignal.push(function() {
			const uuid = getUuid();
			const handleChatTags = () => {
					if (document.visibilityState === "visible")
						OneSignal.getTags().then(e => {
							console.log("getTags");
							if (typeof e === "object") {
								const { pathname } = window.location;
								if (
									pathname === "/chat" &&
									Object.keys(e).includes("vid_user_uuid") &&
									Object.keys(e).includes("chat_user_uuid")
								)
									OneSignal.deleteTags(["chat_user_uuid", "vid_user_uuid"]);
								else if (
									pathname !== "/chat" &&
									!Object.keys(e).includes("vid_user_uuid") &&
									!Object.keys(e).includes("chat_user_uuid")
								)
									OneSignal.sendTags({ chat_user_uuid: uuid, vid_user_uuid: uuid });
							}
						});
				},
				subscribe = () => {
					OneSignal.sendTags({ user_uuid: uuid });
					handleChatTags();
				},
				unsubscribe = () => OneSignal.deleteTags(["user_uuid", "chat_user_uuid", "vid_user_uuid"]);
			OneSignal.init({
				appId: ONE_SIGNAL_KEY,
				autoRegister: false,
				notifyButton: { enable: true, position: "bottom-left" },
				persistNotification: false,
				showCredit: false,
				welcomeNotification: { disable: true }
			});
			// subscribe();
			OneSignal.on("subscriptionChange", subscribed => (subscribed ? subscribe() : unsubscribe()));
			document.addEventListener("visibilitychange", handleChatTags);
			OneSignal.setEmail(getEmail());
			// OneSignal.registerForPushNotifications();
		});
	});
}
