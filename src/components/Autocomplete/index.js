import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import { handlePromise, isDev } from "../../utils";
import { defaultRender, defaultHandleSuggestions } from "./utils";
import "./style.css";

const _Autocomplete = ({
	handleClick,
	getData,
	title = "",
	render = defaultRender,
	handleSuggestions = defaultHandleSuggestions,
	strainer = [],
	setValueOnClick = true,
	...props
}) => {
	const [suggestions, setSuggestions] = useState([]),
		[value, setValue] = useState(title),
		[loading, setLoading] = useState(false),
		[node, setNode] = useState(null),
		ref = useRef(null),
		suggestionsRef = useRef(null),
		handleData = useCallback(
			value =>
				handlePromise(
					getData(value).then(results =>
						setSuggestions(
							results.filter(({ value, id }) => {
								const array = Array.isArray(strainer) ? strainer : [strainer];
								for (let i = 0; i < array.length; i++) {
									const current = array[i];
									if (
										(id && current.id === id) ||
										(value && current.value === value) ||
										value === current
									)
										return false;
								}
								return true;
							})
						)
					),
					setLoading
				),
			[getData, strainer]
		),
		handleInputClick = useCallback(
			_ => {
				if (value) handleData(value);
			},
			[value, handleData]
		),
		onChange = useCallback(
			({ target: { value } }) => {
				setValue(value);
				if (isDev || value.length > 2) {
					if (value) handleData(value);
					else setSuggestions([]);
				}
			},
			[handleData]
		),
		onClick = useCallback(
			({ currentTarget: { dataset } = {} }) => {
				if (setValueOnClick) setValue(dataset.value);
				else setValue("");
				setSuggestions([]);
				handlePromise(Promise.resolve(handleClick({ setValue, ...dataset })), setLoading);
			},
			[handleClick, setValueOnClick]
		),
		onKeyDown = useCallback(
			e => {
				if (
					[38, 40, 9, 13].includes(e.keyCode) &&
					suggestionsRef.current &&
					suggestionsRef.current.children.length
				) {
					let { current } = suggestionsRef,
						{ children } = current,
						{ length } = children,
						suggestions = [];
					for (let i = 0; i < length; i++)
						if (children[i].classList[0] === "suggestion") suggestions.push(children[i]);
					let nodeIndex = suggestions.indexOf(node);
					switch (e.keyCode) {
						case 38: //Up
							e.preventDefault();
							let suggestionUp = suggestions[(nodeIndex > 0 ? nodeIndex : length) - 1];
							if (
								suggestionUp.offsetTop < current.scrollTop ||
								suggestionUp.offsetTop + suggestionUp.clientHeight === current.scrollHeight
							)
								current.scrollTop = suggestionUp.offsetTop;
							setNode(suggestionUp);
							break;
						case 40: //Down
							let suggestionDown = suggestions[(nodeIndex + 1 < length ? nodeIndex : -1) + 1];
							if (
								suggestionDown.clientHeight + suggestionDown.offsetTop >
								current.clientHeight + current.scrollTop
							)
								current.scrollTop =
									suggestionDown.offsetTop - current.clientHeight + suggestionDown.clientHeight;
							else if (suggestionDown.offsetTop <= 30) current.scrollTop = 0;
							setNode(suggestionDown);
							break;
						case 9: //Tab
						case 13: //Enter
							if (node) {
								e.preventDefault();
								onClick({ currentTarget: node });
							}
							break;
						default:
							break;
					}
				}
			},
			[suggestionsRef, node, onClick]
		),
		onMouseMove = useCallback(
			({ currentTarget }) => {
				if (node !== currentTarget) setNode(currentTarget);
			},
			[node]
		),
		handleMouseAway = useCallback(
			({ target }) => {
				if (ref && ref.current && !ref.current.contains(target)) setSuggestions([]);
			},
			[ref]
		);
	useEffect(
		_ => {
			setValue(title);
		},
		[title]
	);
	useEffect(
		_ => {
			if (!suggestions.length && node) setNode(null);
		},
		[suggestions, node]
	);
	useEffect(
		_ => {
			document.addEventListener("mousedown", handleMouseAway);
			return _ => document.removeEventListener("mousedown", handleMouseAway);
		},
		[handleMouseAway]
	);

	return (
		<div className="autocomplete" {...{ ref }}>
			<div>
				{render({
					...props,
					value,
					onChange,
					onKeyDown,
					onClick: handleInputClick,
					autoComplete: "none"
				})}
				{loading && <i className="fas fa-circle-notch fa-spin" />}
			</div>
			{suggestions && suggestions.length > 0 && (
				<div className="suggestions scrollbar" ref={suggestionsRef}>
					{suggestions.map(handleSuggestions(onClick, onMouseMove, node, suggestions))}
				</div>
			)}
		</div>
	);
};

export const Autocomplete = memo(_Autocomplete);
