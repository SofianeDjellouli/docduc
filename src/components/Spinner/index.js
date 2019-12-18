import React from "react";
import "./style.css";

export const Spinner = (size = 100, { ...props }) => (
	<div className="spinner-wrapper" {...props}>
		<img src={`/img/Pacman-0.7s-${size}px.svg`} width={size} height={size} alt="Loading..." />
	</div>
);
