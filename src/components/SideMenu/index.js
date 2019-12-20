import React, { useCallback, memo, useMemo } from "react";
import { useSelector } from "react-redux";
import "./style.css";

const _SideMenu = ({ onSelectEvent, date, index }) => {
  const { appointments } = useSelector(({ appointments }) => ({ appointments }));
  const events = useMemo(
      _ =>
        (appointments[index] || []).filter(
          ({ isFuture, isHistoryWritten, patientInfo, statusCode }) =>
            !!patientInfo && !isHistoryWritten && !isFuture && statusCode !== 3
        ),
      [index, appointments]
    ),
    handleClick = useCallback(
      ({
        currentTarget: {
          dataset: { i }
        }
      }) => onSelectEvent(events[i]),
      [onSelectEvent, events]
    );

  return (
    <div className="calendar-sidemenu">
      <div className="calendar-sidemenu__header">
        <h4 className="calendar-sidemenu__title">
          Doctor's summary for {date.toLocaleString("en-US", { month: "long" })}
        </h4>
        {events.length > 0 && "You haven't added notes to these appointments."}
      </div>
      {events.length > 0 ? (
        events.map(
          (
            {
              id,
              fullTime,
              fullDate,
              typeID,
              patientInfo: { symptoms = [], name, picture } = {},
              start,
              title
            },
            i
          ) => (
            <div
              key={id}
              data-i={i}
              onClick={handleClick}
              className={`sidemenu-event sidemenu-event--${typeID === 1 ? "person" : "video"}`}>
              <div className="sidemenu-centered">
                <i className={`fas fa-${typeID === 1 ? "user" : "video"}`} />
                <div>
                  <div>{fullDate}</div>
                  <div>{fullTime}</div>
                </div>
              </div>
              <hr />
              <div className="sidemenu-event__header">
                <img height="50" width="50" alt={name} src={picture} />
                <span>{name}</span>
              </div>
              <div className="wrap">
                {symptoms.map(({ name }) => (
                  <div className="code" key={name}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )
        )
      ) : (
        <p className="calendar-sidemenu__no-appointments">You have no unreviewed appointments.</p>
      )}
    </div>
  );
};

export const SideMenu = memo(_SideMenu);
