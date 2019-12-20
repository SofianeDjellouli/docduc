import React, { useContext, useRef, useEffect, useCallback, memo } from "react";
import { Fade } from "@material-ui/core";
import { SearchContext } from "../../utils";
import { useToggle } from "../../utils";
import "./style.css";

const _Filter = ({ placeholder, param, title, children, close, handleClear, style }) => {
	const { clearParam } = useContext(SearchContext),
		ref = useRef(null),
		newRef = useRef(null),
		{ toggled, toggle } = useToggle(),
		handleEvent = useCallback(
			({ target }) => {
				if (
					(toggled && newRef.current && !newRef.current.contains(target)) ||
					(!toggled &&
						ref.current &&
						ref.current.contains(target) &&
						target.className !== "fas fa-times-circle")
				)
					toggle();
			},
			[toggled, toggle]
		);
	useEffect(
		_ => {
			if (close && toggled) toggle();
		}, // eslint-disable-next-line react-hooks/exhaustive-deps
		[close, toggle]
	);
	useEffect(
		_ => {
			if (title) toggle();
		},
		[title, toggle]
	);
	useEffect(
		_ => {
			document.addEventListener("mousedown", handleEvent);
			return _ => document.removeEventListener("mousedown", handleEvent);
		},
		[toggled, handleEvent]
	);
	return (
		<div className="filter-wrapper" {...{ ref }}>
			<div className="filter" style={title ? { background: "lightgray", paddingRight: 28 } : null}>
				{title || placeholder}
			</div>
			{/*Condition for the autoFocus to work*/ toggled && (
				<Fade in={toggled}>
					<div className="filter-children-wrapper" {...{ style, ref: newRef }}>
						{children}
					</div>
				</Fade>
			)}
			{title && <i onClick={handleClear || clearParam(param)} className="fas fa-times-circle" />}
		</div>
	);
};

export const Filter = memo(_Filter);
