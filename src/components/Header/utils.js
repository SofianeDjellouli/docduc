import React, { memo, useCallback } from "react";
import { Menu as MuiMenu } from "@material-ui/core";
import { navigate } from "hookrouter";
import { Tooltip } from "../";

const handleLocation = href => navigate(`/${href.toLowerCase()}`);

export const TooltipButton = ({ title, i, onClick = _ => handleLocation(title) }) => (
	<Tooltip placement="bottom" key={title} {...{ title }}>
		<button className="icon-button" aria-label={title} {...{ onClick }}>
			{i}
		</button>
	</Tooltip>
);

const _Menu = ({ anchorEl, setAnchorEl, menuList }) => {
	const handleClose = useCallback(_ => setAnchorEl(null), [setAnchorEl]);
	return (
		<MuiMenu
			disableScrollLock
			className="header-menu"
			open={!!anchorEl}
			onClose={handleClose}
			onClick={handleClose}
			getContentAnchorEl={null}
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			{...{ anchorEl }}>
			{menuList}
		</MuiMenu>
	);
};

export const Menu = memo(_Menu);
