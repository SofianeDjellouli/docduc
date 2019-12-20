import React, { useContext, Fragment, useCallback, memo } from "react";
import { Collapse, IconButton } from "@material-ui/core";
import { SlotPicker, Spinner, Tooltip, AddDoctorForm } from "../";
import { SearchContext, isPatient, useMobile, useToggle } from "../../utils";
import "./style.css";
import "./style.responsive.css";

const _Results = ({ style }) => {
	const {
			highlightedDoctor,
			highlightDoctor,
			openDoctor,
			gender,
			handleScroll,
			handleBooking,
			list,
			doctorsLoading,
			setCareTeam,
			isCareTeam,
			hasSearch,
			slot: { doctorID } = {}
		} = useContext(SearchContext),
		{ toggle, toggled } = useToggle(),
		formToggle = useToggle(),
		isMobile = useMobile(),
		handleMouseEnter = useCallback(
			({
				currentTarget: {
					dataset: { i }
				}
			}) => {
				if (!isMobile) list[i].marker.open(list[i].ID);
			},
			[list, isMobile]
		),
		handleMouseLeave = useCallback(
			({
				currentTarget: {
					dataset: { i }
				}
			}) => {
				if (!isMobile) list[i].marker.open(null);
				highlightDoctor(null);
			},
			[list, isMobile, highlightDoctor]
		),
		onClick = useCallback(
			({
				currentTarget: {
					dataset: { i }
				}
			}) => openDoctor(list[i].ID),
			[list, openDoctor]
		);
	return (
		<div className="results-wrapper">
			{(doctorsLoading || toggled) && Spinner()}
			<div className="results" onScroll={handleScroll} {...{ style }}>
				{list.length > 0 && (
					<Fragment>
						{list.map(
							(
								{
									name,
									ID,
									picture,
									total_review_count,
									address1,
									address2,
									rate,
									mainSpecialty,
									separator,
									type,
									inCareTeam,
									distance,
									...e
								},
								i
							) => {
								const clickProps = { "data-i": i, onClick };
								return (
									<Fragment key={ID}>
										{separator && (
											<div className="separator" dangerouslySetInnerHTML={{ __html: separator }} />
										)}
										<div
											style={
												gender && gender.toLowerCase() !== e.gender.toLowerCase()
													? { display: "none" }
													: null
											}>
											<div
												data-i={i}
												onMouseEnter={handleMouseEnter}
												onMouseLeave={handleMouseLeave}
												className="doctor-wrapper"
												style={
													highlightedDoctor === ID
														? {
																boxShadow: "rgba(0, 0, 0, 0.12) 0 0 12px",
																borderColor: "rgb(0, 108, 112)"
														  }
														: null
												}>
												<div>
													<div className="doctor">
														<div>
															<div>
																<img
																	{...clickProps}
																	src={picture}
																	alt={name}
																	width="125"
																	height="125"
																/>
																<div className="distance">{distance}</div>
															</div>
															<div className="doctor-id">
																<div {...clickProps} className="results-title">
																	{name}
																</div>
																<div>{mainSpecialty}</div>
																<div className="address">
																	{address1}
																	<br />
																	{address2}
																</div>
																<div>
																	{rate}
																	{isPatient() && (
																		<Tooltip
																			title={`${
																				inCareTeam ? "Remove from" : "Add to"
																			} my Care Team`}
																			children={
																				<i
																					data-i={i}
																					className={`fas fa-user-${inCareTeam ? "minus" : "plus"}`}
																					onClick={setCareTeam(
																						inCareTeam ? "remove" : "add",
																						ID,
																						name,
																						toggle
																					)}
																				/>
																			}
																		/>
																	)}
																</div>
															</div>
														</div>
														<button {...clickProps} className="softo-solid-btn">
															Book an appointment
														</button>
													</div>
													<SlotPicker
														isResults
														key={ID !== doctorID}
														handleClick={handleBooking}
														{...{ ID }}
													/>
												</div>
											</div>
										</div>
									</Fragment>
								);
							}
						)}
						<hr />
					</Fragment>
				)}
				{hasSearch && !isCareTeam ? (
					<div className="bottom-form">
						<div className="results-title">
							<i className="fas fa-search-plus right" />
							<span onClick={formToggle.toggle}>
								Don't see your doctor here? No problem, we can add them for you.
							</span>
							<IconButton className="left" size="small" onClick={formToggle.toggle}>
								<i className="material-icons">
									{`keyboard_arrow_${formToggle.toggled ? "up" : "down"}`}
								</i>
							</IconButton>
						</div>
						<Collapse in={formToggle.toggled}>
							<AddDoctorForm toggleForm={formToggle.toggle} />
						</Collapse>
					</div>
				) : (
					isCareTeam && (
						<div className="results-title no-care-team">
							<i className="fas fa-search-plus" /> Find your doctor and add them to your Care Team
							for easier access.
						</div>
					)
				)}
			</div>
		</div>
	);
};

export const Results = memo(_Results);
