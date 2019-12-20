import React, { forwardRef } from "react";
import { Zoom as MuiZoom } from "@material-ui/core";

export const Zoom = forwardRef((props, ref) => <MuiZoom {...{ ...props, ref }} />);
