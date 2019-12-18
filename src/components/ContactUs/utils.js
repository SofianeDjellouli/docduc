import { defaultField } from "../../utils";

let defaultForm = {};
export const fields = ["first_name", "last_name", "email", "topic", "message"];
for (let i = 0; i < fields.length; i++) defaultForm[fields[i]] = defaultField;

export { defaultForm };
