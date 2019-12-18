import React, { memo, useState, useCallback, useRef } from "react";
import { IconButton } from "@material-ui/core";
import { useToggle, useMobile } from "../../utils";
import "./style.css";

const _PracticeMap = ({ office, highlightDoctor, openDoctor, panTo, openID = null }) => {
	const [index, setIndex] = useState(_ => {
			if (openID) for (let i = 0; i < office.length; i++) if (office[i].ID === openID) return i;
			return 0;
		}),
		{ name, mainSpecialty, practice, fullAddress, rate, ID } = office[index],
		toggleCard = useToggle(),
		ref = useRef(),
		handlePrec = useCallback(
			_ =>
				setIndex(index => {
					highlightDoctor(office[index - 1].ID);
					return index - 1;
				}),
			[highlightDoctor, office]
		),
		isMobile = useMobile(),
		handleNext = useCallback(
			_ =>
				setIndex(index => {
					if (!isMobile) highlightDoctor(office[index + 1].ID);
					return index + 1;
				}),
			[highlightDoctor, office, isMobile]
		),
		handleMouseOver = useCallback(
			_ => {
				if (!toggleCard.toggled) {
					panTo();
					if (!isMobile) highlightDoctor(ID);
					toggleCard.toggle();
				}
			},
			[toggleCard, highlightDoctor, ID, panTo, isMobile]
		),
		handleMouseLeave = useCallback(
			({ relatedTarget }) => {
				if (ref.current && !ref.current.contains(relatedTarget)) {
					highlightDoctor(null);
					toggleCard.toggle();
				}
			},
			[toggleCard, highlightDoctor]
		),
		handleClick = useCallback(_ => openDoctor(ID), [openDoctor, ID]);

	return (
		<div className="practice-map-wrapper" {...{ ref }}>
			{(toggleCard.toggled || !!openID) && (
				<div className="practice-map-card-wrapper">
					<div className="practice-map-card" onMouseLeave={handleMouseLeave}>
						<div className="buttons-handler">
							{office.length > 1 && (
								<IconButton
									children={<i className="material-icons">navigate_before</i>}
									onClick={handlePrec}
									disabled={index === 0}
									size="small"
								/>
							)}
							<div onClick={handleClick}>{name}</div>
							{office.length > 1 && (
								<IconButton
									children={<i className="material-icons">navigate_next</i>}
									onClick={handleNext}
									disabled={index === office.length - 1}
									size="small"
								/>
							)}
						</div>
						<div>{mainSpecialty}</div>
						<div>{practice}</div>
						<div>{fullAddress}</div>
						<div>{rate}</div>
					</div>
					<span onMouseLeave={handleMouseLeave} />
				</div>
			)}
			<i
				className="fas fa-map-marker-alt"
				onMouseOver={handleMouseOver}
				onMouseLeave={handleMouseLeave}
				onClick={handleClick}
			/>
		</div>
	);
};

export const PracticeMap = memo(_PracticeMap);
