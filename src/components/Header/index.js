import React, { useCallback, Fragment, memo, useState } from "react";
import { A, navigate } from "hookrouter";
import { IconButton } from "@material-ui/core";
import {
	useToggle,
	getPicture,
	getGender,
	getName,
	isPatient,
	handleHome,
	useMobile,
	handleMenuList
} from "../../utils";
import { ModalSignUp } from "../";
import { TooltipButton, Menu } from "./utils";
import "./style.css";

const _Header = ({ iconButtons = [], solidButtons = [], menuList = [], ...props }) => {
	const [anchorEl, setAnchorEl] = useState(null),
		toggleSignUp = useToggle(),
		isMobile = useMobile(),
		handleMenu = useCallback(({ currentTarget }) => setAnchorEl(currentTarget), []),
		name = getName();
	return (
		<header>
			<div id="fixed-header" {...props}>
				<div className="container">
					<A href="/" onClick={handleHome}>
						<img src="/img/logo.png" alt="Docduc" />
					</A>
					{isMobile ? (
						<IconButton className="right" onClick={handleMenu}>
							<i className="fas fa-bars" />
						</IconButton>
					) : (
						<Fragment>
							{iconButtons.map(TooltipButton)}
							{name ? (
								<div className="menu-wrapper">
									<img
										width="40"
										height="40"
										src={
											getPicture() ||
											`/img/${isPatient ? "patient" : "doctor"}${getGender() || "Male"}.svg`
										}
										alt={name}
										onClick={handleMenu}
										{...(!!anchorEl && { className: "secondary" })}
									/>
								</div>
							) : (
								<Fragment>
									{solidButtons.map(({ onClick, title }) => (
										<button
											className="softo-solid-btn softo-btn-outline"
											key={title}
											{...{ onClick }}>
											{title}
										</button>
									))}
									<button className="softo-solid-btn end-right" onClick={toggleSignUp.toggle}>
										Sign up
									</button>
								</Fragment>
							)}
						</Fragment>
					)}
				</div>
			</div>
			<ModalSignUp open={toggleSignUp.toggled} onClose={toggleSignUp.toggle} />
			<Menu
				{...{ anchorEl, setAnchorEl }}
				menuList={
					isMobile && !getName()
						? [
								{
									title: "Sign in",
									i: <i className="fas fa-sign-in-alt" />,
									onClick: _ => navigate("/sign-in")
								},
								{
									title: "Sign up",
									i: <i className="fas fa-stethoscope" />,
									onClick: toggleSignUp.toggle
								}
						  ].map(handleMenuList)
						: menuList
				}
			/>
		</header>
	);
};

export const Header = memo(
	_Header /*, (prev, { solidButtons = [], menuList = [] }) => {
	if (!(prev.menuList && prev.menuList.length) && menuList.length) return false;
	for (let i = 0; i < solidButtons.length; i++)
		if (solidButtons[i].title !== prev.solidButtons[i].title) return false;
	return true;
}*/
);
