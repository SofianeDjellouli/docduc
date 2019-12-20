import React, { useState, useCallback, useRef } from "react";
import { IconButton, Button } from "@material-ui/core";
import { Spinner, ModalPatientAppointment, Tooltip } from "../";
import {
  useToggle,
  useScroll,
  handlePromise,
  bookingPatientRequest,
  PatientCalendarContext,
  patientsRequest
} from "../../utils";
import { fromString, MyFab, mapData, handleSearch, PAGE_SIZE } from "./utils";
import "./style.css";

let toDate,
  page = 0,
  end = false;

const PatientCalendar = () => {
  const [eventIndex, setEventIndex] = useState(undefined),
    eventsLoading = useToggle(),
    proceduresLoading = useToggle(),
    getEvents = useCallback(
      _ =>
        handlePromise(
          (toDate
            ? Promise.resolve(null)
            : // when is the farest appointment in the future?
              bookingPatientRequest
                .get("0/1?descending=true")
                .then(
                  ({ data }) =>
                    (toDate = (data[0] ? data[0].startTime : new Date().toJSON())
                      .replace("T", " ")
                      .slice(0, 16))
                )
          )
            .then(_ =>
              bookingPatientRequest.get(
                `${page}/${PAGE_SIZE}?descending=true${fromString}${toDate}`
              )
            )
            .then(({ data }) => {
              if (data.length < PAGE_SIZE) end = true;
              page++;
              return mapData(data);
            }),
          eventsLoading.toggle
        ),
      [eventsLoading.toggle]
    ),
    ref = useRef(),
    { onScroll, events, setEvents } = useScroll(ref, getEvents, eventsLoading.toggled || end),
    handleEvent = useCallback(
      ({
        currentTarget: {
          dataset: { i }
        }
      }) => setEventIndex(i),
      []
    ),
    getData = useCallback(
      (/*symptoms, */ id) =>
        handlePromise(
          /*Promise.all([
            get(
              `${API}search/triage?symptoms=${symptoms
                .map(({ symptom_id }) => symptom_id)
                .join(",")}`
            ),*/
          patientsRequest
            .get(`booking/get_services/${id}`)
            /*])*/ .then(
              /*([conditions, procedures])*/ ({ data }) =>
                setEvents(events => {
                  for (let i = 0; i < events.length; i++)
                    if (events[i].id === id)
                      return [
                        ...events.slice(0, i),
                        {
                          ...events[i],
                          /* conditions: conditions.data.map(
                        ({ medical_tests, other_specific_tests, ...e }) => ({
                          ...e,
                          tests: [
                            ...handleSplit(medical_tests),
                            ...handleSplit(other_specific_tests)
                          ]
                        })
                      ),*/
                          procedures: /*procedures.*/ data.map(
                            ({
                              diagnoses,
                              service_сode, //Russian "c" for getting
                              service_description,
                              price,
                              payment_type,
                              insurance_type,
                              status
                            }) => ({
                              diagnoses: diagnoses.map(({ description, code }) => ({
                                description,
                                code
                              })),
                              service_сode, //Russian "c" for getting
                              service_description,
                              price,
                              payment_type,
                              insurance_type,
                              status
                            })
                          )
                        },
                        ...events.slice(i + 1)
                      ];
                  return events;
                })
            ),
          proceduresLoading.toggle
        ),
      [proceduresLoading.toggle, setEvents]
    );

  return (
    <main className="patient-calendar">
      <div className="App" {...{ onScroll, ref }}>
        <div className="wrapper-background">
          <img className="background" src="/img/waitingroom.jpg" alt="background" />
        </div>
        <div className="container">
          <div className="app-title">Your appointment schedule</div>
          {events &&
            (events.length > 0 ? (
              events.map(({ old, day, month, id, time, type, name, speciality }, i) => (
                <div className="event" key={id}>
                  <div className={`date event-color${old ? "-dark" : ""}`}>
                    <div>
                      <div>{day}</div>
                      <div>{month}</div>
                    </div>
                  </div>
                  <div className="info">
                    <div>
                      <div>{`${type} with ${name}`}</div>
                      <div>{speciality}</div>
                      <div>{time}</div>
                    </div>
                  </div>
                  <div className="details">
                    <IconButton
                      data-i={i}
                      onClick={handleEvent}
                      children={<i className="material-icons">navigate_next</i>}
                    />
                  </div>
                </div>
              ))
            ) : eventsLoading.toggled ? (
              Spinner()
            ) : (
              <div className="flex-center">
                <Button color="primary" variant="contained" onClick={handleSearch}>
                  Book an appointment
                </Button>
              </div>
            ))}
          <Tooltip title="Book a new appointment">
            <MyFab />
          </Tooltip>
        </div>
      </div>
      <PatientCalendarContext.Provider value={{ setEvents }}>
        <ModalPatientAppointment
          event={events[eventIndex]}
          loading={proceduresLoading.toggled}
          {...{ setEventIndex, getData }}
        />
      </PatientCalendarContext.Provider>
    </main>
  );
};

export default PatientCalendar;
