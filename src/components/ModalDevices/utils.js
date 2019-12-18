import React from "react";

export const mapDevices = ({ label, deviceId }) => ({ label, deviceId });
export const renderDevices = ({ label, deviceId }) => (
	<option key={label} value={deviceId}>
		{label}
	</option>
);
