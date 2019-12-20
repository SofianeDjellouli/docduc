import React from "react";
import { defaultField } from "../../utils";
import { Input } from "@material-ui/core";

export const defaultForm = { procedure: defaultField, date: { value: new Date(), error: "" } };

export const render = props => <Input {...props} />;
