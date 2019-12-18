import React, { memo, useCallback } from "react";
import { Chip } from "@material-ui/core";
import { Modal, Zoom } from "../";

const _Condition = ({
	condition: { name, tests = [], sub_symptoms = [], treatment, videos = [], workup } = {},
	setCondition
}) => {
	const onClose = useCallback(_ => setCondition(undefined), [setCondition]);
	return (
		<Modal open={Boolean(name)} TransitionComponent={Zoom} title={name} {...{ onClose }}>
			<div className="modal-title">Sub Symptoms</div>
			{sub_symptoms}
			<div className="modal-title">Treatment</div>
			{treatment}
			<div className="modal-title">Workup</div>
			{workup}
			<div className="modal-title">Tests</div>
			{tests && tests.map(e => <Chip color="primary" key={e} label={e} />)}
			<div className="modal-title">Videos</div>
			{videos && videos.length > 0 && (
				<ul>
					{videos.map(({ player_links, title }, i) => (
						<li key={i + title}>
							<a target="_blank" href={player_links} rel="noopener noreferrer">
								{title}
							</a>
						</li>
					))}
				</ul>
			)}
		</Modal>
	);
};

export const Condition = memo(_Condition);
