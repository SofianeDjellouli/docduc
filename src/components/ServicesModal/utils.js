import React from "react";
import { Input } from "@material-ui/core";
import { debounce, searchRequest } from "../../utils";

export const getData = url =>
	debounce(value =>
		searchRequest.get(`${url}?q=${value}`).then(({ data }) => {
			if (data.length)
				return data.map(({ id, code, description }) => ({ value: description, id, code }));
			return [];
		})
	);

export const defaultService = { service_id: "", service_code: "", service_description: "" };

export const defaultForm = {
	...defaultService,
	diagnoses: [],
	price: "",
	payment_type: "",
	insurance_type: "",
	errors: { service: "", diagnoses: "", price: "", insurance_type: "", payment_type: "" }
};

export const MuiInput = props => <Input fullWidth {...props} />;

export const handleSuggestions = (onClick, onMouseMove, node) => ({ value, code, id }, i) => (
	<div
		className="suggestion"
		data-value={value}
		key={value + i}
		data-id={id}
		data-code={code}
		{...{
			onClick,
			onMouseMove,
			...(node && value === node.dataset.value && { style: { background: "lightgray" } })
		}}>
		{value}
	</div>
);
