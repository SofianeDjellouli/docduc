import React, { Fragment, memo } from "react";
import { Tooltip } from "../";
import "./style.css";

const _Event = ({ event = {}, onSelectEvent }) => {
  const {
    typeID,
    statusCode,
    reason,
    fullTime,
    isNotChecked,
    patientInfo: { symptoms = [], picture, name } = {},
    typeDescription
  } = event;
  const Icon = <i className={`fas fa-${typeID === 1 ? "user" : "video"} right`} />;
  const eventComponent = (
    <div className="event">
      {Icon}
      {fullTime}
      {isNotChecked && <div className="warning-dot" />}
    </div>
  );
  if (onSelectEvent)
    return (
      <button className="event__button" onClick={() => onSelectEvent(event)} type="button">
        {eventComponent}
      </button>
    );
  return (
    <Tooltip
      type={1}
      title={
        <div className="event-tooltip">
          <div className="event-tooltip-title">
            {Icon}
            <span>{fullTime}</span>
          </div>
          <hr />
          {name ? (
            <Fragment>
              <div className="event-tooltip-card">
                <img src={picture} alt={name} width="50" height="50" />
                <span>{name}</span>
              </div>
              <div className="wrap">
                {symptoms.map(({ name }) => (
                  <div className="code" key={name}>
                    {name}
                  </div>
                ))}
              </div>
            </Fragment>
          ) : (
            <span className="event-tooltip__description">{typeDescription} slot</span>
          )}
          {statusCode === 3 && (
            <Fragment>
              <hr />
              <div className="appointment-canceled-title">Appointment canceled</div>
              {reason}
            </Fragment>
          )}
        </div>
      }>
      {eventComponent}
    </Tooltip>
  );
};

export const Event = memo(_Event);
