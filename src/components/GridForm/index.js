import React from "react";
import { Grid } from "@material-ui/core";

export const GridForm = ({ children, ...props }) => (
	<Grid container spacing={3} component="form" {...props}>
		{children}
	</Grid>
);
