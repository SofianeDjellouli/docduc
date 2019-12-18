import React, { useState, useCallback, Fragment, useEffect, useMemo } from "react"; // eslint-disable-next-line
import { Button, Grid } from "@material-ui/core";
import { A } from "hookrouter";
import {
	Calendar,
	Autocomplete,
	ModalTeam,
	getDoctors,
	handleSuggestions,
	Profile,
	ModalEmail
} from "../";
import {
	handleLogin,
	useToggle,
	isAdmin,
	isDev,
	handleSignOut,
	adminProfileRequest
} from "../../utils";
import "./style.css";

const Admin = _ => {
	const [selectedDoctor, setSelectedDoctor] = useState({}),
		{ name, email, login_id, ID } = selectedDoctor,
		toggleTeam = useToggle(),
		toggleCalendar = useToggle(),
		toggleProfile = useToggle(),
		toggleEmail = useToggle(),
		toggleClaim = useToggle(),
		handleDoctor = useCallback(({ doctor }) => setSelectedDoctor(JSON.parse(doctor)), []),
		handleLoginAs = useCallback(
			_ => {
				adminProfileRequest.post("login_as", { login_id }).then(handleLogin);
			},
			[login_id]
		),
		handleReviews = useCallback(
			(reviewsDone, reviews = []) =>
				setSelectedDoctor(selectedDoctor => ({
					...selectedDoctor,
					reviewsDone,
					reviews: [...selectedDoctor.reviews, ...reviews]
				})),
			[]
		),
		handleClaim = useCallback(
			_ => {
				adminProfileRequest.post("", { doctor_id: ID }).then(_ => {
					window.alert("Success");
					toggleClaim.toggle();
				});
			},
			[ID, toggleClaim]
		);

	useEffect(
		_ => {
			if (ID) adminProfileRequest.get(`doctor_with_setting/${ID}`).then(console.log);
		},
		[ID]
	);

	return (
		<Fragment>
			<div className="container pt-50">
				<Grid container spacing={3} justify="center">
					<Grid item sm={4}>
						<Autocomplete
							autoFocus
							placeholder="Search for a doctor"
							setValueOnClick={false}
							getData={getDoctors}
							handleClick={handleDoctor}
							{...{ handleSuggestions }}
						/>
					</Grid>
					{isAdmin && (
						<Grid item sm={4}>
							<Button onClick={toggleTeam.toggle} color="primary">
								Add Team Member
							</Button>
						</Grid>
					)}
					<Button onClick={handleSignOut} color="primary">
						Log out
					</Button>
					{name && (
						<Grid item sm={12}>
							{`You selected ${name}`}
							<Button onClick={toggleProfile.toggle} color="primary">
								See profile
							</Button>
							<Button onClick={toggleCalendar.toggle} color="primary">
								{`${toggleCalendar.toggled ? "Hide" : "See"} calendar`}
							</Button>
							{toggleClaim.toggled && (
								<Button onClick={handleClaim} color="primary">
									Claim profile
								</Button>
							)}
							{isAdmin && (
								<Fragment>
									<Button onClick={handleLoginAs} color="primary">
										{`Login as ${name}`}
									</Button>
									<Button onClick={toggleEmail.toggle} color="primary">
										Change email
									</Button>
								</Fragment>
							)}
							<div>
								{`To reset ${name}'s password:`}
								<ul>
									<li>
										click{" "}
										<A href="/sign-in" target="_blank">
											here
										</A>
									</li>
									<li>then click on "I forgot my password."</li>
									<li>{`Then enter ${name}'s email: ${email}`}</li>
								</ul>
							</div>
						</Grid>
					)}
					{toggleCalendar.toggled && <Calendar {...{ ID }} doctor_id={ID} />}
				</Grid>
			</div>
			{isAdmin && (
				<Fragment>
					<ModalTeam open={toggleTeam.toggled} onClose={toggleTeam.toggle} />
					<ModalEmail open={toggleEmail.toggled} onClose={toggleEmail.toggle} {...{ login_id }} />
				</Fragment>
			)}
			{toggleProfile.toggled && (
				<Profile
					openProfile={toggleProfile.toggled}
					handleClose={toggleProfile.toggle}
					{...{ selectedDoctor, handleReviews }}
				/>
			)}
		</Fragment>
	);
};

export default Admin;

/*
admin endpoints all have
/v1/admin/appointments
/create - it has same params as the regular appointment create but also has doctor_id
POST body:
uint `json:"doctor_id"`
string    `json:"start_time" binding:"required"`
string    `json:"end_time" binding:"required"`
int       `json:"duration" binding:"required"`
int       `json:"typeID" binding:"required"`
int       `json:"rep_id"`
DELETE /remove/:id - same as regular
body
int `json:"batch"`
POST /cancel - cancel of booked app same as regular
uint   `json:"appointmentID" binding:"required"`
string `json:"reason" binding:"required"`
POST /move_booking - new one. Used for moving of booking from one slot to other. Have to be same doctor
body:
uint `json:"old_appointment_id" binding:"required"`
uint `json:"new_appointment_id" binding:"required"`
GET /calendar/:doctor_id - same as for doctor
query params:
size, page, type, from_date, to_date (edited) 

all this has
v1/admin/profile
POST /login_as
body:
uint `json:"login_id" binding:"required"`
POST /create_sales
string `json:"email" binding:"required"`
string `json:"password" binding:"required"`
string `json:"first_name" binding:"required"`
string `json:"last_name" binding:"required"`
POST /change_email
string `json:"new_email" binding:"required"`
uint   `json:"login_id" binding:"required"`
For forgot password use regular forgot password
*/
