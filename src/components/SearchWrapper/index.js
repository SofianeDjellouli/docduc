import React, { useCallback, useContext } from "react";
import { Fade, RadioGroup } from "@material-ui/core";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { Map, Results, Autocomplete, Filter } from "../";
import {
  getSearch,
  handleClickMain,
  SearchContext,
  handleSearchSuggestions,
  isPatient,
  getLanguages,
  getInsurances,
  useToggle,
  useMobile
} from "../../utils";
import { CustomControl, FilterAutocomplete, AutocompletePlace } from "./utils";
import "react-day-picker/lib/style.css";
import "./style.css";
import "./style.responsive.css";

export const SearchWrapper = ({
  newSearch,
  handleAppointmentFilter,
  clearAppointmentFilter,
  toggleCareTeam
  // place
}) => {
  const {
      setParam,
      clearParam,
      date,
      gender,
      q,
      language,
      ins,
      map,
      appointmentFilter,
      isCareTeam
    } = useContext(SearchContext),
    /*mainValue = UseValue({ q }),
    whereValue = UseValue(""),
    insValue = UseValue({ ins }),
    languageValue = UseValue({ language }),*/
    isResults = useToggle(),
    mapToggled = isResults.toggled,
    toggleFilters = useToggle(),
    isMobile = useMobile(),
    handleGender = useCallback(
      ({ target: { value } }) => {
        if (value !== gender) setParam({ gender: value });
      },
      [gender, setParam]
    ),
    handleDate = useCallback(from => setParam({ from }), [setParam]),
    formatDate = useCallback(
      date => date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      []
    ),
    handleSubmit = useCallback(
      e => {
        e.preventDefault();
        document.querySelector(".results").scrollTo({ top: 0, behavior: "auto" });
        if (toggleFilters.toggled) toggleFilters.toggle();
        newSearch();
      },
      [toggleFilters, newSearch]
    );

  return (
    <main className="search">
      <div className="search-form-wrapper">
        <form className="search-form" onSubmit={handleSubmit}>
          <div>
            <div>
              <i className="fas fa-search" />
              <Autocomplete
                autoFocus
                placeholder="Doctor name, specialty, condition, symptom..."
                getData={getSearch}
                param="q"
                title={q}
                handleClick={handleClickMain}
                handleSuggestions={handleSearchSuggestions}
              />
            </div>
            {map && <AutocompletePlace />}
          </div>
          <button type="submit">
            {isMobile && "Search"}
            <i className="fas fa-search" />
          </button>
          {isMobile && (
            <button onClick={toggleFilters.toggle} type="button">
              Filters
              <i className="fas fa-filter" />
            </button>
          )}
        </form>
        <Fade in={!isMobile || toggleFilters.toggled}>
          <div className="filters">
            <Filter {...{ placeholder: "Gender", param: "gender", title: gender }}>
              <RadioGroup value={gender} onChange={handleGender} style={{ display: "block" }}>
                {["Female", "Male"].map(CustomControl)}
              </RadioGroup>
            </Filter>
            <div className="filter-wrapper">
              <DayPickerInput
                value={date}
                onDayChange={handleDate}
                formatDate={formatDate}
                dayPickerProps={{ selectedDays: date, disabledDays: { before: new Date() } }}
                inputProps={{
                  readOnly: true,
                  className: "filter",
                  ...(date && { style: { background: "lightgray" } })
                }}
                placeholder="Date"
                classNames={{
                  overlayWrapper: "filter-children-wrapper day-picker",
                  overlay: "",
                  container: ""
                }}
              />
              {date && <i onClick={clearParam("from")} className="fas fa-times-circle" />}
            </div>
            <FilterAutocomplete
              {...{
                getData: getLanguages,
                placeholder: "Language spoken",
                param: "language",
                title: language
                // ...languageValue
              }}
            />
            <FilterAutocomplete
              {...{
                placeholder: "Insurance accepted",
                param: "ins",
                title: ins,
                getData: getInsurances,
                // ...insValue,
                width: isMobile ? 240 : 300
              }}
            />
            <Filter
              placeholder="Appointment type"
              param="appointmentFilter"
              title={appointmentFilter}
              handleClear={clearAppointmentFilter}>
              <RadioGroup
                value={appointmentFilter}
                onChange={handleAppointmentFilter}
                style={{ display: "block" }}>
                {["In person", "Video"].map(CustomControl)}
              </RadioGroup>
            </Filter>
            {isPatient() && (
              <div
                className={`filter-wrapper filter care-team${
                  isCareTeam ? " care-team-active" : ""
                }`}
                onClick={toggleCareTeam}>
                My Care Team
              </div>
            )}
          </div>
        </Fade>
      </div>
      <div className="components-wrapper">
        {isMobile && (
          <div onClick={isResults.toggle} className="bottom-button switcher">
            {`${mapToggled ? "List" : "Map"}`}
            <i className={`fas fa-${mapToggled ? "stream" : "map-marker"}`} />
          </div>
        )}
        <Results {...(isMobile && mapToggled && { style: { display: "none" } })} />
        <Map {...(isMobile && !mapToggled && { style: { display: "none" } })} />
      </div>
    </main>
  );
};
