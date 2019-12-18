import React from "react";

export const defaultRender = props => <input {...props} />;

const style = { background: "lightgray" };
export const defaultHandleSuggestions = (onClick, onMouseMove, node) => ({ value, id }, i) => (
	<div
		className="suggestion"
		data-value={value}
		key={value + i}
		{...{
			onClick,
			onMouseMove,
			...(id && { "data-id": id }),
			...(node && value === node.dataset.value && { style })
		}}>
		{value}
	</div>
);
