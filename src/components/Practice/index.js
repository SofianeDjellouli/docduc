import React, { Component, Fragment, Suspense, lazy } from "react";
import { navigate } from "hookrouter";
import { ListItemAvatar, ListItemText, ListItemIcon, Avatar, MenuItem } from "@material-ui/core";
import { EmptyChat, fallback, ModalInviteDoctor, Tooltip } from "../";
import {
  getLoginId,
  handleLocalData,
  practiceRequest,
  EMPTY_MESSAGE,
  defaultHeaderProps,
  GlobalContext
} from "../../utils";
import { parseDoctor, sortDoctors, navigateToCalendar, navigateToChat } from "./utils";
import "./style.css";

const Chat = lazy(_ => import("../Chat"));
const DoctorCalendar = lazy(_ => import("../DoctorCalendar"));

class Practice extends Component {
  state = { doctors: [], invite: false };

  componentDidMount() {
    practiceRequest
      .get("get_doctors")
      .then(({ data }) => this.setDoctors(data.map(parseDoctor)))
      .then(this.getUsers);
    // setInterval(this.getUsers, window.location.host === "docduc.com" ? 300000 : 30000);
  }

  componentWillUnmount() {
    this.props.resetHeader();
  }

  thenState = state => new Promise(resolve => this.setState(state, resolve));

  setDoctors = doctors =>
    this.thenState({ doctors }).then(_ =>
      this.props.setHeaderProps(props => {
        const { doctors } = this.state,
          firstDoctor = doctors[0];
        return {
          ...props,
          menuList: [
            ...doctors.map(
              ({ name, picture, mainSpecialtyID, newMessages, newAppointments }, i) => (
                <MenuItem divider key={name + i} {...(i === 0 && { selected: true })}>
                  <ListItemIcon
                    onClick={this.handleIconClick}
                    data-destination="calendar"
                    data-i={i}
                    className="relative">
                    {newAppointments ? (
                      <Tooltip title="New appointments">
                        <span>
                          <i className="material-icons">calendar_today</i>
                          <span className="warning-new" />
                        </span>
                      </Tooltip>
                    ) : (
                      <i className="material-icons">calendar_today</i>
                    )}
                  </ListItemIcon>
                  <ListItemIcon
                    onClick={this.handleIconClick}
                    data-destination="chat"
                    data-i={i}
                    className="relative">
                    {newMessages ? (
                      <Tooltip title="New messages">
                        <span>
                          <i className="fas fa-comment-alt" />
                          <span className="warning-new" />
                        </span>
                      </Tooltip>
                    ) : (
                      <i className="fas fa-comment-alt" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={name} secondary={mainSpecialtyID} />
                  <ListItemAvatar children={<Avatar src={picture} />} />
                </MenuItem>
              )
            ),
            defaultHeaderProps().menuList[2]
          ],
          iconButtons: [
            {
              title: "Calendar",
              i: (
                <Fragment>
                  <i className="material-icons">calendar_today</i>
                  {firstDoctor.newAppointments && <span className="warning-new" />}
                </Fragment>
              ),
              onClick: navigateToCalendar
            },
            {
              title: "Chat",
              i: (
                <Fragment>
                  <i className="fas fa-comment-alt" />
                  {firstDoctor.newMessages && <span className="warning-new" />}
                </Fragment>
              ),
              onClick: navigateToChat
            },
            {
              title: "Invite doctors",
              i: <i className="material-icons">group_add</i>,
              onClick: this.toggleInvite
            }
          ]
        };
      })
    );

  toggleInvite = _ => this.setState(({ invite }) => ({ invite: !invite }));

  getUsers = loadedDoctors => {
    const { doctors } = this.state;
    if ((loadedDoctors && loadedDoctors.length) || doctors.length)
      return Promise.all(["unchecked_bookings", "unread_messages"].map(practiceRequest.get))
        .then(([unchecked, { data }]) => {
          const _doctors = (loadedDoctors || doctors).map(el => {
            const hasID = a => a.map(e => e.doctor_id).includes(el.ID);
            return { ...el, newMessages: hasID(data), newAppointments: hasID(unchecked.data) };
          });
          return this.setDoctors([
            ...(loadedDoctors
              ? sortDoctors(_doctors)
              : [_doctors[0], ...sortDoctors(_doctors.slice(1))])
          ]);
        })
        .then(_ => handleLocalData(this.state.doctors[0]));
  };

  handleIconClick = ({
    currentTarget: {
      dataset: { i, destination }
    }
  }) => {
    if (i !== "0") {
      const { doctors } = this.state,
        _doctors = [...doctors];
      _doctors.splice(i, 1);
      handleLocalData(doctors[i]);
      this.setDoctors([doctors[i], ...sortDoctors(_doctors)]);
    }
    navigate(`/practice/${destination}`);
  };

  render() {
    const { app } = this.props,
      { invite, doctors } = this.state,
      isChat = app === "chat";
    return (
      <Fragment>
        {doctors.length > 0 ? (
          <Suspense {...{ fallback }}>
            <Fragment>
              {isChat ? <Chat ID={getLoginId()} /> : <DoctorCalendar ID={getLoginId()} />}
            </Fragment>
          </Suspense>
        ) : (
          <main>{EmptyChat(EMPTY_MESSAGE)}</main>
        )}
        <ModalInviteDoctor open={invite} onClose={this.toggleInvite} />
      </Fragment>
    );
  }
}

const _Practice = _ => (
  <GlobalContext.Consumer>{context => <Practice {...context} />}</GlobalContext.Consumer>
);

export default _Practice;
