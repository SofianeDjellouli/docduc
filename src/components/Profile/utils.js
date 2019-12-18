import React, { forwardRef } from "react";
import { Zoom } from "@material-ui/core";

export const TransitionComponent = forwardRef((props, ref) => <Zoom {...{ ref, ...props }} />);
export const PAGE_SIZE = "20";
