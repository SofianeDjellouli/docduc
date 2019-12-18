import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { momentLocalizer } from "react-big-calendar";
import { firstVisibleDay, lastVisibleDay } from "react-big-calendar/lib/utils/dates";
import { getAppointments, getCalendarLink } from "./actions";
import { getFullDate, now } from "../../utils";

// const {  REACT_APP_CALENDAR_KEY, REACT_APP_OAUTH_ID } = process.env;

export const CalendarHOCWrapper = ComposedComponent => {
  class CalendarHOC extends Component {
    state = {
      index: "",
      isMenuOpen: false,
      isSyncOpen: false,
      loading: true,
      eventId: null,
      slot: {},
      date: now
    };

    componentDidMount() {
      const { getAppointments, getCalendarLink } = this.props;
      const from = moment(firstVisibleDay(now, momentLocalizer(moment))).format("YYYY-MM-DD");
      const to = moment(lastVisibleDay(now, momentLocalizer(moment))).format("YYYY-MM-DD");
      const index = `${from}_${to}`;
      Promise.all([getAppointments({ from, to }), getCalendarLink()]).then(_ =>
        this.setState({ index, loading: false })
      );
    }

    handleToggleMenu = _ => this.setState(({ isMenuOpen }) => ({ isMenuOpen: !isMenuOpen }));

    handleToggleSync = _ => this.setState(({ isSyncOpen }) => ({ isSyncOpen: !isSyncOpen }));

    handleNavigate = date => {
      const from = moment(firstVisibleDay(date, momentLocalizer(moment))).format("YYYY-MM-DD");
      const to = moment(lastVisibleDay(date, momentLocalizer(moment))).format("YYYY-MM-DD");
      const index = `${from}_${to}`;
      this.setState({ index, date, loading: true }, _ =>
        this.props.getAppointments({ from, to }).then(_ => this.setState({ loading: false }))
      );
    };

    handleSelectEvent = eventId => {
      //Not canceled
      if (eventId.statusCode !== 3) this.setState({ eventId: eventId.id });
    };

    handleSelectSlot = ({ start, end, slots }) => {
      if (!this.state.loading) {
        const startDate = moment(start).valueOf();
        const today = moment().valueOf();
        let _slots = [...slots];
        // we prevent having a slot ending at 11:59
        if (end && end.getMinutes() === 59) {
          end.setMinutes(45);
          _slots.splice(1, 1);
        } else if (document.querySelector(".rbc-month-view") && end) end.setMinutes(30);
        if (start && startDate >= today)
          this.setState({ slot: { start, end, slots: _slots, fullDate: getFullDate(start) } });
      }
    };

    onClose = _ => this.setState({ eventId: null, slot: {} });

    render() {
      return (
        <ComposedComponent
          {...{ ...this.props, ...this.state }}
          onClose={this.onClose}
          onClickFilter={this.handleClickFilter}
          onNavigate={this.handleNavigate}
          onSelectEvent={this.handleSelectEvent}
          onSelectSlot={this.handleSelectSlot}
          onToggleMenu={this.handleToggleMenu}
          onToggleSync={this.handleToggleSync}
        />
      );
    }
  }

  return connect(
    ({ calendarLink }) => ({ calendarLink }),
    { getAppointments, getCalendarLink }
  )(CalendarHOC);
};
