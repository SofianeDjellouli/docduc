import React, { memo, useCallback } from "react";
import moment from "moment";
import { Button, ButtonGroup } from "@material-ui/core";
import { now } from "../../utils";
import { TooltipButton, TooltipFab } from "../";
import "./style.css";

const _Toolbar = ({
  date,
  filters: { video, person },
  label,
  view,
  views,
  handleFilters,
  onNavigate,
  onToggleMenu,
  onToggleSync,
  onView
}) => {
  const viewState = view === "agenda" ? "days" : view;
  const prev = moment(date).subtract(1, viewState);
  const next = moment(date).add(1, viewState);
  const previousDate = new Date(prev.valueOf());
  const nextDate = new Date(next.valueOf());
  const tooltipView = view === "agenda" ? "slots" : view,
    handleView = useCallback(
      ({
        currentTarget: {
          dataset: { view }
        }
      }) => onView(view),
      [onView]
    );
  return (
    <div className="calendar-toolbar">
      <div className="buttons-wrapper">
        <ButtonGroup>
          <TooltipButton title={`Previous ${tooltipView}`} onClick={() => onNavigate(previousDate)}>
            <i className="material-icons">navigate_before</i>
          </TooltipButton>
          <Button onClick={() => onNavigate(now)}>Today</Button>
          <TooltipButton title={`Next ${tooltipView}`} onClick={() => onNavigate(nextDate)}>
            <i className="material-icons">navigate_next</i>
          </TooltipButton>
        </ButtonGroup>
        <ButtonGroup style={{ marginLeft: 12 }}>
          <TooltipButton
            title="In person slots"
            name="person"
            onClick={handleFilters}
            {...(person && { color: "primary", variant: "contained" })}>
            <i className="fas fa-user" />
          </TooltipButton>
          <TooltipButton
            title="Video slots"
            name="video"
            {...(video && { color: "primary", variant: "contained" })}
            onClick={handleFilters}>
            <i className="fas fa-video" />
          </TooltipButton>
        </ButtonGroup>
      </div>
      <b>{label}</b>
      <div className="calendar-toolbar__rigth">
        <ButtonGroup style={{ marginRight: 12 }}>
          {views.map(v => (
            <Button
              key={v}
              data-view={v}
              onClick={handleView}
              {...(v === view && { color: "primary", variant: "contained" })}>
              {v[0].toUpperCase() + v.substr(1)}
            </Button>
          ))}
        </ButtonGroup>
        <TooltipFab style={{ marginRight: 12 }} title="Sync" onClick={onToggleSync}>
          <i className="material-icons">sync</i>
        </TooltipFab>
        <TooltipFab title="Unreviewed appointments" onClick={onToggleMenu}>
          <i className="fas fa-bars" />
        </TooltipFab>
      </div>
    </div>
  );
};

export const Toolbar = memo(_Toolbar);
