import React, { Fragment, useEffect, useCallback, useState, memo } from "react";
import { Grid } from "@material-ui/core";
import { DatePicker } from "@material-ui/pickers";
import { navigate } from "hookrouter";
import {
  useToggle,
  handlePromise,
  geocode,
  loadMap,
  getLanguages,
  getInsurances,
  getPlaces,
  getSpecialtyOrName,
  isPatient,
  handleSearchSuggestions as handleSuggestions
} from "../../utils";
import { RenderAuto, GridForm } from "../";
import { defaultForm, handleCareTeam } from "./utils";
import "./style.css";

let _type;

const _SearchForm = _ => {
  const [form, setForm] = useState(defaultForm),
    toggleLoading = useToggle(),
    onChange = useCallback(
      name => ({ value, type }) => {
        if (name === "q") _type = type === "Doctors" ? "name" : "specialty";
        setForm(form => ({ ...form, [name]: { ...form[name], value, error: "" } }));
      },
      []
    ),
    handleName = useCallback(
      name => ({
        handleClick: onChange(name),
        name,
        "aria-label": name,
        className: "form-input",
        ...form[name]
      }),
      [form, onChange]
    ),
    handleFrom = useCallback(value => onChange("from")({ value }), [onChange]),
    handleSubmit = useCallback(
      e => {
        e.preventDefault();
        let { value } = form.location;
        (value
          ? handlePromise(
              new Promise(async resolve => {
                const { lat, lng } = await geocode(value),
                  location = { lat, lng, location: value },
                  locationKeys = Object.keys(location);
                for (let i = 0; i < locationKeys.length; i++)
                  resolve(localStorage.setItem(locationKeys[i], location[locationKeys[i]]));
              }),
              toggleLoading.toggle
            )
          : Promise.resolve(null)
        ).then(_ => {
          const formKeys = Object.keys(form);
          let searchString = "/search?";
          for (let i = 0; i < formKeys.length; i++) {
            let key = formKeys[i],
              { value } = form[key];
            if (value) {
              let keyValue;
              switch (key) {
                case "from":
                  keyValue = value.format("DD/MM/YYYY");
                  break;
                case "q":
                  keyValue = `${_type === "name" ? value.slice(4) : value}&type=${_type}`;
                  break;
                default:
                  keyValue = value;
              }
              searchString += `&${key}=${keyValue}`;
            }
          }
          navigate(searchString);
        });
      },
      [toggleLoading.toggle, form]
    );

  useEffect(_ => {
    loadMap();
  }, []);

  const { value } = form.from;

  return (
    <Fragment>
      <h3>Search</h3>
      <GridForm onSubmit={handleSubmit}>
        <RenderAuto
          autoFocus
          sm={12}
          getData={getSpecialtyOrName}
          placeholder="Specialization or name"
          {...{ handleSuggestions, ...handleName("q") }}
        />
        <RenderAuto
          sm={12}
          getData={getInsurances}
          placeholder="Insurance"
          {...handleName("ins")}
        />
        <Grid item xs={12} sm={6}>
          <DatePicker
            disablePast
            fullWidth
            format="DD/MM/YYYY"
            emptyLabel="Date"
            views={["year", "month", "date"]}
            onChange={handleFrom}
            InputProps={{
              disableUnderline: true,
              ...(!value && { style: { color: "gray" } })
            }}
            inputProps={{ "aria-label": "Date of birth", className: "form-input" }}
            {...{ value }}
          />
        </Grid>
        <RenderAuto placeholder="Languages" getData={getLanguages} {...handleName("languages")} />
        <RenderAuto
          sm={12}
          getData={getPlaces}
          placeholder="Location"
          {...handleName("location")}
        />
        {isPatient() && (
          <Grid item>
            <button onClick={handleCareTeam} className="softo-solid-btn">
              My Care Team
            </button>
          </Grid>
        )}
        <Grid item xs />
        <Grid item>
          <button type="submit" disabled={toggleLoading.toggled} className="softo-solid-btn">
            {toggleLoading.toggled && <i className="fas fa-circle-notch fa-spin right" />}
            Search
          </button>
        </Grid>
      </GridForm>
    </Fragment>
  );
};

export const SearchForm = memo(_SearchForm);
