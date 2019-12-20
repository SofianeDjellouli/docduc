import { defaultField } from "../../utils";

let defaultForm = {};
const defaultFields = [
	"firstName",
	"lastName",
	"email",
	"password",
	"gender",
	"confirmEmail",
	"confirmPassword"
];
for (let i = 0; i < defaultFields.length; i++) defaultForm[defaultFields[i]] = defaultField;
defaultForm.DOB = { ...defaultField, value: null };

const genders = [{ label: "Female", _value: "Female" }, { label: "Male", _value: "Male" }];

export { defaultForm, genders };
