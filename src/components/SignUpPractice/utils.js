import { defaultField, requiredField } from "../../utils";

let fields = {};
const required = [
	"name",
	"firstName",
	"lastName",
	"addressLine1",
	"city",
	"state",
	"phone",
	"email",
	"confirmEmail",
	"password",
	"confirmPassword"
];
for (let i = 0; i < required.length; i++) fields[required[i]] = requiredField;
const _default = ["addressLine2", "zip", "lat", "lng"];
for (let i = 0; i < _default.length; i++) fields[_default[i]] = defaultField;

export { fields };
