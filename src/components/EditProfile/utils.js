import React from "react";
import { sortByName, formatDate, allOnTop } from "../../utils";
import moment from "moment";

export const Primary = "Primary Care Physician";

const style = { background: "lightgray" };

export const handleSuggestions = (onClick, onMouseMove, node, suggestions) => (
  { value, description },
  i
) => (
  <div
    className="suggestion"
    key={value + i}
    data-value={value}
    data-i={i}
    {...{
      onClick,
      onMouseMove,
      ...(node && value === node.dataset.value && i.toString() === node.dataset.i && { style })
    }}>
    <div className="suggestion-wrapper">
      <div className="suggestion-title">{value}</div>
      <div className="suggestion-subtitle">{description}</div>
    </div>
  </div>
);

const handleSplit = a => (a ? a.split(",") : []);

export const handleDoctorData = ({
  spokenLanguage,
  subSpecialtyID,
  insurances,
  abmsCert = "",
  settings: { disable_booking_fee } = {},
  // chargeFees,
  setSnackbar,
  setData,
  ...data
}) => {
  let profile = {
    spokenLanguage: handleSplit(spokenLanguage),
    subSpecialtyID: handleSplit(subSpecialtyID),
    abmsCert: abmsCert.toLowerCase() === "yes",
    insurances: insurances ? allOnTop(sortByName(insurances)) : [],
    // chargeFees: !disable_booking_fee,
    picture: "",
    firstName: "",
    lastName: "",
    practice: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    latitude: null,
    longitude: null,
    phone: "",
    aboutDescription: "",
    license: "",
    mainSpecialtyID: "",
    isPrimaryCarePhysician: false,
    gender: ""
  };
  const dataKeys = Object.keys(data);
  for (let i = 0; i < dataKeys.length; i++) {
    const key = dataKeys[i];
    if (profile.hasOwnProperty(key)) profile[key] = data[key];
  }
  return profile;
};

export const handlePatientData = ({
  setSnackbar,
  setData,
  medical: { surgical_history, ...medical } = {},
  insurance_plan: { name, plan, ID } = {},
  insurance_info: { member_policy_number, group_number, ...prim } = {},
  ...data
}) => {
  let profile = {
    insurance_plan: { plan: !ID ? "Pay out of pocket" : `${name} - ${plan}`, ID },
    member_policy_number,
    group_number,
    prim,
    surgical_history: surgical_history.map(({ procedure, date }) => ({
      procedure,
      date: formatDate(date)
    })),
    ...medical,
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    gender: "",
    phone: "",
    DOB: "",
    image_url: ""
  };
  const dataKeys = Object.keys(data);
  for (let i = 0; i < dataKeys.length; i++) {
    const key = dataKeys[i];
    if (profile.hasOwnProperty(key)) profile[key] = data[key];
  }
  return profile;
};

export const genders = [{ label: "Female", _value: "Female" }, { label: "Male", _value: "Male" }];

export const toJSONDate = date => moment(date).format("YYYY-MM-DD");
