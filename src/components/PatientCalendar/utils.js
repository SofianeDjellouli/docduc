import React, { forwardRef } from "react";
import { Fab } from "@material-ui/core";
import { navigate } from "hookrouter";
import { now } from "../../utils";

export const fromString = "&from_date=2018-09-26%2016:41&to_date=";

export const timeFormat = { hour: "2-digit", minute: "2-digit" };

export const MyFab = forwardRef((props, ref) => (
  <Fab {...{ ...props, ref }} className="fab-search event-color" href="/search" size="large">
    <i className="fas fa-plus" />
  </Fab>
));

export const mapData = data =>
  data.map(
    ({
      doctor_first_name,
      doctor_last_name,
      typeID,
      status,
      symptoms,
      note,
      image_url,
      gender,
      file_link,
      doctor_speciality,
      startTime,
      endTime,
      patient_history,
      appointmentID,
      doctor_id,
      is_reviewed
    }) => {
      const start = new Date(startTime);
      return {
        id: appointmentID,
        doctor_id,
        name: `Dr. ${doctor_first_name} ${doctor_last_name}`,
        type: `${typeID === 1 ? "A" : "Video a"}ppointment`,
        status: ["Pending", "In progress", "Payed"][status],
        note,
        picture: image_url || `/img/doctor${gender}.svg`,
        files: file_link,
        speciality: doctor_speciality,
        old: start < now,
        day: start.toLocaleString("en-US", { day: "numeric" }),
        month: start.toLocaleString("en-US", { month: "short" }).toUpperCase(),
        date: start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
        time: `${start.toLocaleString("en-US", timeFormat)} - ${new Date(endTime).toLocaleString(
          "en-US",
          timeFormat
        )}`,
        symptoms,
        comment: patient_history && patient_history.comment,
        is_reviewed
      };
    }
  );

export const handleSearch = _ => navigate("/search/my-care-team");

export const PAGE_SIZE = "25";
