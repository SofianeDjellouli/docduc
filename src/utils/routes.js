import React, { lazy } from "react";
import { isPatient, getId } from "./";

const Home = lazy(_ => import("../components/Home"));
const SignIn = lazy(_ => import("../components/SignIn"));
const Chatbot = lazy(_ => import("../components/Chatbot"));
const Legal = lazy(_ => import("../components/Legal"));
const ThankYou = lazy(_ => import("../components/ThankYou"));
const SignUpDoctor = lazy(_ => import("../components/SignUpDoctor"));
const Settings = lazy(_ => import("../components/Settings"));
const PatientCalendar = lazy(_ => import("../components/PatientCalendar"));
const Search = lazy(_ => import("../components/Search"));
const Chat = lazy(_ => import("../components/Chat"));
const DoctorCalendar = lazy(_ => import("../components/DoctorCalendar"));
const Practice = lazy(_ => import("../components/Practice"));
const SignUpPractice = lazy(_ => import("../components/SignUpPractice"));
const Verify = lazy(_ => import("../components/Verify"));

export const routes = {
	"/": _ => <Home />,
	"/patients": _ => <Home />,
	"/doctors": _ => <Home user={0} />,
	"/legal/:tab": ({ tab }) => <Legal {...{ tab }} />,
	"/chat": _ => <Chat ID={getId()} />,
	"/search": _ => <Search />,
	"/search/my-care-team": _ => <Search isCareTeam />,
	"/sign-up-doctor": _ => <SignUpDoctor />,
	"/calendar": _ => (isPatient() ? <PatientCalendar /> : <DoctorCalendar ID={getId()} />),
	"/sign-in": _ => <SignIn />,
	"/practice/:app": ({ app }) => <Practice {...{ app }} />,
	"/sign-up-practice": _ => <SignUpPractice />,
	// "/admin": _ => <Admin />,
	"/chatbot": _ => <Chatbot />,
	"/verify": _ => <Verify />,
	// "/join": _ => <Join />,
	"/thank-you": _ => <ThankYou />,
	"/settings/:tab": ({ tab }) => <Settings {...{ tab }} />
};
