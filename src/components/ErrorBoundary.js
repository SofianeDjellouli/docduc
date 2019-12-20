import React from "react";
import { EmptyChat } from "./";
import { DEFAULT_ERROR } from "../utils";

export class ErrorBoundary extends React.Component {
	state = { error: false };

	componentDidCatch(error, info) {
		console.error(error, info);
		this.setState({ error: true });
	}

	render() {
		return this.state.error ? <main>{EmptyChat(DEFAULT_ERROR)}</main> : this.props.children;
	}
}
