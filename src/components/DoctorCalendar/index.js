import React, { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Slide } from "@material-ui/core";
import reducers from "./reducers";
import {
  BigCalendar,
  Spinner,
  SideMenu,
  SlotForm,
  Appointment,
  Slot,
  Tooltip,
  ReduxComponent
} from "../";
import { CalendarHOCWrapper } from "./CalendarHOC";
import { RenderModal, handleCalendarLink, DOMObserver } from "./utils";
import "./style.css";

const _DoctorCalendar = ({
  isMenuOpen,
  isSyncOpen,
  loading,
  menuEvents,
  eventId,
  slot,
  onClose,
  calendarLink,
  calendarLinkRef,
  onSelectEvent,
  index,
  date,
  filters,
  ...props
  // handleCalendar
}) => {
  const events = useSelector(({ appointments }) => Object.values(appointments)[0] || []),
    event = useMemo(
      _ => {
        for (let i = 0; i < events.length; i++) if (events[i].id === eventId) return events[i];
        return slot;
      },
      [events, eventId, slot]
    );

  useEffect(_ => {
    DOMObserver.observe(document.querySelector(".rbc-calendar"), {
      subtree: true,
      childList: true
    });
    return _ => DOMObserver.disconnect();
  }, []);

  return (
    <main className="doctor-calendar">
      <div className="container relative">
        {loading && Spinner(100)}
        <div className="slide-wrapper">
          <Slide direction="left" in={isMenuOpen}>
            <div className="fullcalendar__menu scrollbar">
              <SideMenu {...{ onSelectEvent, index, date }} />
            </div>
          </Slide>
        </div>
        <div className="slide-wrapper">
          <Slide direction="left" in={isSyncOpen}>
            <div className="fullcalendar__menu scrollbar fullcalendar__link">
              Sync this Docduc board's calendar with your personal calendar.
              <div>
                <strong>iCalendar Feed</strong>
              </div>
              <Tooltip type={0} placement="bottom" title="Click to copy to your clipboard.">
                <input
                  value={calendarLink}
                  readOnly
                  id="calendar-link"
                  onClick={handleCalendarLink}
                />
              </Tooltip>
              <a
                href="https://support.google.com/calendar/answer/37100?co=GENIE.Platform%3DDesktop&hl=en"
                target="_blank"
                rel="noopener noreferrer">
                How to add it to your Google calendar.
              </a>
            </div>
          </Slide>
        </div>
        <BigCalendar {...{ ...props, onSelectEvent, events, date }} />
      </div>
      {RenderModal(event.patientInfo ? Appointment : event.id ? Slot : event.start && SlotForm)({
        event,
        onClose
      })}
    </main>
  );
};

const DoctorCalendar = CalendarHOCWrapper(_DoctorCalendar);

const ConnectedCalendar = props => (
  <ReduxComponent Component={DoctorCalendar} {...{ reducers, ...props }} />
);

export default ConnectedCalendar;
