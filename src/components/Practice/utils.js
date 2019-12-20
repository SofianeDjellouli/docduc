import { navigate } from "hookrouter";

export const sortDoctors = a =>
	a
		.sort((a, b) => (a.newMessages > b.newMessages ? -1 : 0))
		.sort((a, b) => (a.newAppointments > b.newAppointments ? -1 : 0));

export const navigateToChat = _ => navigate("/practice/chat");
export const navigateToCalendar = _ => navigate("/practice/calendar");

export const parseDoctor = ({
	firstName,
	lastName,
	picture,
	gender,
	token,
	mainSpecialtyID,
	ID,
	email,
	login_id,
	addressLine1,
	login: { uuid, pub_nub_auth_token } = {}
}) => ({
	token,
	email,
	login_id,
	addressLine1,
	gender,
	uuid,
	pub_nub_auth_token,
	ID,
	mainSpecialtyID,
	name: `Dr. ${firstName} ${lastName}`,
	userType: "1",
	picture: picture || `/img/doctor${gender}.svg`
});
