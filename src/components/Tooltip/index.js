import React, { Fragment, useState, forwardRef, memo } from "react";
import { Tooltip as MuiTooltip, Fab, Button, IconButton } from "@material-ui/core";
import { useStylesTooltip } from "./utils";

const _Tooltip = ({ title, placement = "top", type = 0, ...props }) => {
	const { arrow, ...classes } = useStylesTooltip(type)();
	const [arrowRef, setArrowRef] = useState(null);
	return (
		<MuiTooltip
			PopperProps={{
				popperOptions: { modifiers: { arrow: { enabled: Boolean(arrowRef), element: arrowRef } } }
			}}
			{...{ placement, classes, ...props }}
			title={
				<Fragment>
					{title}
					<span className={arrow} ref={setArrowRef} />
				</Fragment>
			}
		/>
	);
};

export const Tooltip = memo(_Tooltip);

const TooltipComposed = Component => ({ children, title, ...props }) => (
	<Tooltip {...{ title, type: 0 }} children={<Component {...{ children, ...props }} />} />
);

export const TooltipButton = TooltipComposed(Button);
export const TooltipFab = TooltipComposed(
	forwardRef((props, ref) => <Fab {...{ ...props, ref }} size="small" />)
);

export const TooltipInfo = props => (
	<Tooltip children={<i className="fas fa-question-circle left" />} {...props} />
);

export const TooltipIcon = ({ title, ...props }) => (
	<Tooltip {...{ title }} children={<IconButton {...props} />} />
);
