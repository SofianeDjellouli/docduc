import React, { useEffect, useState, useContext, useCallback, useMemo, memo } from "react";
import { IconButton, Collapse } from "@material-ui/core";
import { Spinner } from "../";
import {
	handlePromise,
	SearchContext,
	GlobalContext,
	handleFromTo,
	getType,
	useToggle,
	useMobile,
	baseRequest
} from "../../utils";
import { handleTime, getDays, handleSlots, twoDaysAhead, handleDate } from "./utils";
import "./style.css";
import "./style.responsive.css";

export const _SlotPicker = ({ ID, handleClick, isPopup, isResults }) => {
	const { setSnackbar } = useContext(GlobalContext),
		{ date, setSlot, appointmentFilter } = useContext(SearchContext),
		[slots, setSlots] = useState(new Array(5).fill({ slots: [] })),
		loading = useToggle(),
		[day, setDay] = useState(handleDate(date)),
		{ toggled, toggle } = useToggle(),
		isMobile = useMobile(),
		fitlerSlots = useCallback(
			slots => {
				let list = [...slots.map(({ slots }) => ({ slots: [...slots] }))];
				if (isResults && appointmentFilter) {
					for (let i = 0; i < list.length; i++)
						list[i].slots = list[i].slots.filter(
							({ typeID }) => typeID && typeID === (appointmentFilter === "In person" ? 1 : 2)
						);
				}
				let max = 4;
				for (let i = 0; i < list.length; i++) {
					let slotsLength = list[i].slots.length;
					if (slotsLength > max) max = slotsLength;
				}
				for (let i = 0; i < list.length; i++)
					while (list[i].slots.length < max) list[i].slots.push(<i className="fas fa-minus" />);
				return list;
			},
			[appointmentFilter, isResults]
		),
		slotsList = useMemo(_ => fitlerSlots(slots), [slots, fitlerSlots]),
		handleMore = useCallback(
			_ => {
				if (!isPopup)
					for (let i = 0; i < slots.length; i++)
						if (slotsList[i].slots.length > 4)
							return (
								<div className="see-more-wrapper">
									<div className="bottom-button see-more" onClick={toggle}>{`See ${
										toggled ? "less" : "more"
									}`}</div>
								</div>
							);
			},
			[toggle, toggled, slotsList, slots, isPopup]
		),
		handlePrec = useCallback(
			_ => setDay(day => handleDate(new Date(new Date(day).setDate(day.getDate() - 5)))),
			[]
		),
		handleNext = useCallback(
			_ => setDay(day => new Date(new Date(day).setDate(day.getDate() + 5))),
			[]
		),
		handleSlot = useCallback(
			({
				currentTarget: {
					dataset: { i, index }
				}
			}) => {
				const type = getType();
				if (!type) return setSnackbar("Please login first.");
				if (type !== "6") return setSnackbar("Please use a patient account.");
				if (handleClick && ID) handleClick(ID);
				setSlot(slots[i].slots[index]);
			},
			[setSlot, slots, setSnackbar, handleClick, ID]
		),
		getSlots = useCallback(
			_ => {
				if (ID) {
					let days = getDays(day),
						{ from, to } = handleFromTo(days[0].date, days[days.length - 1].date);
					handlePromise(
						// 24 h * 4 slots / hour * 5 days  = 480
						baseRequest
							.get(`appointment/patient/${ID}/0/480?from_date=${from}&to_date=${to}`)
							.then(({ data }) =>
								setSlots(
									handleSlots(
										day,
										data.map(({ ID, typeID, startTime, endTime, doctorID }) => {
											const handleStart = handleTime(startTime),
												time = { hour: "numeric", minute: "numeric" };
											return {
												ID,
												typeID,
												weekday: handleStart({ weekday: "long" }),
												startTimeDate: handleStart({ month: "short", day: "numeric" }),
												startTime: handleStart(time),
												endTime: handleTime(endTime)(time),
												doctorID
											};
										})
									)
								)
							),
						loading.toggle
					);
				}
			},
			[loading.toggle, day, ID]
		);

	useEffect(_ => setDay(handleDate(date)), [date]);

	useEffect(getSlots, [ID, day]);

	return (
		<div className={`slot-picker-wrapper${isPopup ? " slot-picker-popup" : ""}`}>
			<Collapse className="scrollbar" in={toggled} collapsedHeight={`${isMobile ? "8" : "21"}0px`}>
				<div
					className="slot-picker"
					{...(!isPopup && !toggled && { style: { overflowY: "hidden" } })}>
					<IconButton
						children={<i className="material-icons">navigate_before</i>}
						onClick={handlePrec}
						disabled={day.toDateString() === twoDaysAhead.toDateString()}
					/>
					<div>
						<div style={{ display: "flex" }}>
							{getDays(day).map(({ weekday, monthdate }) => (
								<div key={monthdate} className="column head">
									<div>{weekday}</div>
									<div>{monthdate}</div>
								</div>
							))}
						</div>
						<div className="slots-wrapper">
							{loading.toggled
								? Spinner()
								: day &&
								  slotsList.map(({ slots }, i) => (
										<div className="column" key={i}>
											{slots.map((el, index) => (
												<div
													key={index}
													className={`${el.startTime ? "free" : ""} slot`}
													onClick={el.startTime && handleSlot}
													data-index={index}
													data-i={i}>
													{el.startTime && (
														<i className={`fas fa-${el.typeID === 1 ? "user" : "video"}`} />
													)}
													{el.startTime || el}
												</div>
											))}
										</div>
								  ))}
						</div>
					</div>
					<IconButton
						children={<i className="material-icons">navigate_next</i>}
						onClick={handleNext}
						style={{ padding: 0 }}
					/>
				</div>
			</Collapse>
			{handleMore()}
		</div>
	);
};

export const SlotPicker = memo(_SlotPicker);
