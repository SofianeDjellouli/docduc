import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { createAppointments } from "../DoctorCalendar/actions";

const SlotFormHOCWrapper = ComposedComponent => {
  class SlotFormHOC extends Component {
    state = {
      deleteVisible: false,
      deleting: false,
      duration: 15,
      endTime: moment(),
      isValidTime: true,
      isVisible: false,
      repID: 1,
      slots: 1,
      startTime: moment(),
      typeID: 1
    };

    componentDidMount() {
      const {
        event: { duration, end, start, typeID, slots }
      } = this.props;
      this.setState(
        {
          duration: duration || 15,
          endTime: moment(end),
          startTime: moment(start),
          slots: slots ? slots.length : 1,
          typeID: typeID || 1
        },
        this.updateTime
      );
    }

    handleButtonChange = ({ currentTarget: { name, dataset: { i, type } = {} } = {} }) =>
      this.setState({ [name]: parseInt(i || type) });

    handleTime = type => e => this.setState({ [type]: e }, this.updateTime);

    handleDuration = ({ target: { value } }) => this.setState({ duration: value }, this.updateTime);

    updateTime = () => {
      const { duration, endTime, startTime } = this.state;
      const diff = moment(endTime).diff(startTime, "minutes");
      if (diff < 0)
        this.setState(
          {
            endTime:
              endTime.format("a") === "pm"
                ? moment(startTime).add(duration, "minutes")
                : moment(endTime).add(12, "hours")
          },
          this.updateTime
        );
      else
        this.setState({
          slots: Math.floor(diff / duration),
          isValidTime:
            moment(endTime).valueOf() <
            moment(startTime)
              .endOf("day")
              .valueOf()
        });
    };

    handleSubmit = () => {
      const { duration, endTime, isValidTime, repID, startTime, typeID } = this.state;
      const appointments = [];
      const appointment = { duration, endTime, isValidTime, repID, startTime, typeID };
      if (typeID === 3) {
        appointments.push({ ...appointment, typeID: 1 });
        appointments.push({ ...appointment, typeID: 2 });
      } else appointments.push(appointment);
      return this.createAppointments(appointments);
    };

    createAppointments = (appointments, totalNewSlots = 0) => {
      const { setSnackbar, createAppointments } = this.props;
      if (!appointments.length) {
        if (totalNewSlots)
          setSnackbar({
            message: `You created ${totalNewSlots === 1 ? "one" : totalNewSlots} slot${
              totalNewSlots > 1 ? "s" : ""
            }.`,
            type: 0
          });
        else setSnackbar({ message: "No slots were created" });
      } else
        return createAppointments({ appointment: appointments[0] }).then(slotsCreated => {
          appointments.splice(0, 1);
          return this.createAppointments(appointments, (totalNewSlots += slotsCreated));
        });
    };

    handleToggleDelete = () =>
      this.setState(({ deleteVisible }) => ({ deleteVisible: !deleteVisible }));

    render() {
      const { handleButtonChange, handleDuration, handleTime, state, props } = this;
      return (
        <ComposedComponent
          {...{ ...state, ...props, handleButtonChange, handleTime, handleDuration }}
          onDelete={this.handleDelete}
          onSubmit={this.handleSubmit}
          onToggleDelete={this.handleToggleDelete}
        />
      );
    }
  }

  return connect(
    null,
    { createAppointments }
  )(SlotFormHOC);
};

export default SlotFormHOCWrapper;
