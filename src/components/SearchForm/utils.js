import { navigate } from "hookrouter";
import { defaultField } from "../../utils";

let defaultForm = {};
const fields = ["q", "ins", "languages", "location"];
for (let i = 0; i < fields.length; i++) defaultForm[fields[i]] = defaultField;
defaultForm.from = { value: null, error: "" };

export { defaultForm };

export const handleCareTeam = _ => navigate("/search/my-care-team");
