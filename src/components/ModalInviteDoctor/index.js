import React, { memo, useContext, useCallback, useState, Fragment } from "react";
import { Button, ListItemAvatar, ListItemText, Avatar, ListItem } from "@material-ui/core";
import { Modal, Autocomplete } from "../";
import { GlobalContext, practiceRequest, getDoctors, handleDoctorsSuggestions } from "../../utils";
import "./style.css";

const _ModalInviteDoctor = ({ open, onClose }) => {
	const { setSnackbar } = useContext(GlobalContext),
		[{ value, mainSpecialtyID, login_id, picture }, setDoctor] = useState({}),
		handleClick = useCallback(({ doctor, setValue }) => {
			const _doctor = JSON.parse(doctor);
			setValue(_doctor.value);
			setDoctor(_doctor);
		}, []),
		handleInvite = useCallback(
			_ =>
				practiceRequest.post("invite_doctor_to_practice", { doctor_id: login_id }).then(_ => {
					setSnackbar({ message: `You successfully invited ${value} to your practice.`, type: 0 });
					onClose();
				}),
			[setSnackbar, onClose, value, login_id]
		);
	return (
		<Modal
			className="modal-invite-doctor"
			title="Invite a doctor to you practice"
			{...{
				open,
				onClose,
				...(value && {
					actions: (
						<Button color="primary" onClick={handleInvite}>
							Add
						</Button>
					)
				})
			}}>
			<Autocomplete
				autoFocus
				getData={getDoctors}
				handleSuggestions={handleDoctorsSuggestions}
				{...{ handleClick }}
			/>
			{value && (
				<Fragment>
					Would you like to invite {value} to your practice account?
					<ListItem divider>
						<ListItemText primary={value} secondary={mainSpecialtyID} />
						<ListItemAvatar children={<Avatar src={picture} />} />
					</ListItem>
				</Fragment>
			)}
		</Modal>
	);
};

export const ModalInviteDoctor = memo(_ModalInviteDoctor);
