import React, { Fragment } from "react";
import { Title } from "../../utils";

export const genders = [{ label: "Female", _value: "Female" }, { label: "Male", _value: "Male" }];

export const Primary = "Primary Care Physician";

export const pickAddress = "Please pick an address from the list";

let defaultForm = {},
  defaultAddressForm = {},
  value = { value: "" },
  array = { value: [] },
  _false = { value: false },
  // _true = { value: true },
  required = { value: "", required: true },
  defaultAddress = {
    latitude: required,
    longitude: required,
    city: required,
    state: required,
    addressLine1: required,
    zip: value
  };
export const formSteps = [
  {
    firstName: required,
    lastName: required,
    gender: required,
    phone: required,
    picture: value,
    spokenLanguage: array
  },
  { practice: required, aboutDescription: value, addressLine2: value, ...defaultAddress },
  {
    mainSpecialtyID: required,
    // chargeFees: _true,
    insurances: array,
    subSpecialtyID: array,
    license: required,
    abmsCert: _false,
    isPrimaryCarePhysician: _false
  },
  { email: required, confirmEmail: required, password: required, confirmPassword: required }
];

const defaultAddressKeys = Object.keys(defaultAddress);
for (let i = 0; i < defaultAddressKeys.length; i++) {
  const key = defaultAddressKeys[i];
  defaultAddressForm[key] = defaultAddress[key].value;
}

for (let i = 0; i < formSteps.length; i++) {
  const formStepsKeys = Object.keys(formSteps[i]);
  for (let j = 0; j < formStepsKeys.length; j++) {
    const key = formStepsKeys[j];
    defaultForm[key] = formSteps[i][key].value;
  }
}

export { defaultForm, defaultAddressForm };
export const { /*chargeFees,*/ ...errors } = defaultForm;

export const FormTitle = a => (
  <Fragment>
    {Title(a)}
    <div className="title-info">* Asterisk fields are mandatory.</div>
  </Fragment>
);

export const asPatient = _ => window.open("/patients#sign_up");
