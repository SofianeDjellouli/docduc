import { createContext } from "react";

export const GlobalContext = createContext({});
export const SearchContext = createContext({});
export const PatientCalendarContext = createContext({});

const {
	NODE_ENV,
	REACT_APP_API,
	REACT_APP_MAP_KEY,
	REACT_APP_STRIPE_KEY,
	REACT_APP_BRANCH_TEST,
	REACT_APP_BRANCH_PROD,
	REACT_APP_TURN_USER_NAME,
	REACT_APP_TURN_CREDENTIAL,
	REACT_APP_PUBLISH_KEY,
	REACT_APP_SUBSCRIBE_KEY,
	REACT_APP_ONE_SIGNAL_ID
} = process.env;
const { ONE_SIGNAL_ID, PUBNUB_PUBLISH_KEY, PUBNUB_SUBSCRIBE_KEY, API_URL, STRIPE_PUB_KEY } = window;

export { REACT_APP_TURN_USER_NAME, REACT_APP_TURN_CREDENTIAL };

export const isDev = NODE_ENV === "development";

export const BRANCH_KEY = isDev ? REACT_APP_BRANCH_TEST : REACT_APP_BRANCH_PROD;

export const ONE_SIGNAL_KEY = isDev ? REACT_APP_ONE_SIGNAL_ID : ONE_SIGNAL_ID;

export const API = isDev ? REACT_APP_API : API_URL;

export const STRIPE_KEY = isDev ? REACT_APP_STRIPE_KEY : STRIPE_PUB_KEY;

export const PUBLISH_KEY = isDev ? REACT_APP_PUBLISH_KEY : PUBNUB_PUBLISH_KEY;
export const SUBSCRIBE_KEY = isDev ? REACT_APP_SUBSCRIBE_KEY : PUBNUB_SUBSCRIBE_KEY;

export const MAP_KEY = REACT_APP_MAP_KEY;

export const BUBBLER_CLASS_NAME = "message-bubbler message-bubbler-";
export const BUBBLER_COVER_CLASS_NAME = "message-bubbler-cover message-bubbler-cover-";

export const MINIMUM_MESSAGES = 20;
export const MINIMUM_CHATS = 10;

export const EMPTY_MESSAGE = "Doctors and patients connect here";

export const isAdmin = !!localStorage.isSuperAdmin;

export const DEFAULT_ERROR =
	"An error occured, please try again. Often, clearing your cache will solve the issue.";

export const defaultLat = 38.9071923;
export const defaultLng = -77.03687070000001;

export const defaultField = { value: "", error: "" };
export const requiredField = { ...defaultField, required: true };
