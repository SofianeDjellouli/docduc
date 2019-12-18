import React from "react";
import { defaultField } from "../../utils";

let defaultForm = {};
const defaultFields = ["firstname", "lastname", "email", "phone", "practice_specialty"];
for (let i = 0; i < defaultFields.length; i++) defaultForm[defaultFields[i]] = defaultField;

export { defaultForm };

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
