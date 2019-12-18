import React, { useMemo, memo, useState, useCallback } from "react";
import { Calendar } from "react-big-calendar";
import { Toolbar, Event } from "../";
import * as utils from "./utils";

const _BigCalendar = ({
  onNavigate,
  onSelectEvent,
  onToggleMenu,
  onToggleSync,
  events,
  ...props
}) => {
  const [filters, setFilters] = useState({ person: false, video: false }),
    handleFilters = useCallback(
      ({ currentTarget: { name } }) =>
        setFilters(filters => {
          const other = name === "video" ? "person" : "video",
            noFiltersName = !filters[name],
            filtersOther = filters[other];
          return {
            [other]: noFiltersName && filtersOther ? false : filtersOther,
            [name]: noFiltersName
          };
        }),
      []
    ),
    filteredEvents = useMemo(
      _ => {
        const { person, video } = filters;
        return person || video
          ? events.filter(({ typeID }) => (person && typeID === 1) || (video && typeID === 2))
          : events;
      },
      [events, filters]
    ),
    components = useMemo(
      _ => ({
        toolbar: props => (
          <Toolbar
            {...{ ...props, onNavigate, onToggleMenu, onToggleSync, handleFilters, filters }}
          />
        ),
        event: Event,
        agenda: { event: props => <Event {...{ ...props, onSelectEvent }} /> }
      }),
      [filters, handleFilters, onNavigate, onSelectEvent, onToggleSync, onToggleMenu]
    );
  return (
    <Calendar
      selectable
      popup
      events={filteredEvents}
      {...{ onNavigate, onSelectEvent, components, ...props, ...utils }}
    />
  );
};

export const BigCalendar = memo(_BigCalendar);
