import React, { Component, Fragment } from "react";
import { Chip, Zoom, Slide, Paper, Grid } from "@material-ui/core";
import { Autocomplete, Tooltip } from "../";
import {
  getType,
  getSymptoms,
  baseAuthRequest,
  searchRequest,
  getPosition,
  loadMap,
  geocode,
  defaultLat,
  defaultLng
} from "../../utils";
import { isLarge } from "./utils";
import "./style.css";

class Chatbot extends Component {
  state = {
    symptom: [],
    condition: [],
    address: "",
    specialties: [],
    openDetails: false,
    detailsBackgroundColor: "",
    conditionFocused: {},
    checkSymptoms: true,
    checkConditions: false,
    checkSpecializations: false,
    pastChecked: "",
    lat: defaultLat,
    lng: defaultLng
  };

  componentDidMount() {
    loadMap()
      .then(_ => {
        const type = getType();
        if (type)
          return baseAuthRequest
            .get(type === "1" ? "doctor" : "patient")
            .then(({ data: { latitude, longitude, addressLine1 } = {} }) => {
              if (latitude && longitude) return { lat: latitude, lng: longitude };
              else if (addressLine1) return geocode(addressLine1);
            });
      })
      .then(({ lat, lng }) => ({ lat, lng } || getPosition()))
      .then(
        center =>
          new window.google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            center,
            disableDefaultUI: true
          })
      )
      .then(location => this.setState(location));

    document.querySelector("#symptoms input").addEventListener("focus", this.handleFocus);
    document.querySelector("#symptoms input").addEventListener("blur", this.handleBlur);
  }

  componentWillUnmount() {
    document.querySelector("#symptoms input").removeEventListener("focus", this.handleFocus);
    document.querySelector("#symptoms input").removeEventListener("blur", this.handleBlur);
  }

  setCurrentPosition = _ => getPosition().then(this.setState);

  handleSymptoms = ({ value, id }) =>
    this.setState(
      ({ symptom }) => ({
        symptom: [...symptom, { value, id }],
        checkConditions: true,
        checkSymptoms: false,
        checkSpecializations: false,
        openDetails: false,
        specialties: []
      }),
      this.getConditions
    );

  getConditions = () =>
    searchRequest
      .get(`triage?symptoms=${this.state.symptom.map(({ id }) => id).join(",")}`)
      .then(({ data }) => this.setState({ condition: data.slice(0, 5) }));

  handleRemove = index =>
    this.setState(
      ({ symptom }) => {
        let _remover = symptom;
        _remover.splice(index, 1);
        return { symptom: _remover };
      },
      () => {
        if (!this.state.symptom.length)
          this.setState({
            condition: [],
            checkConditions: false,
            checkSpecializations: false,
            checkSymptoms: true,
            openDetails: false,
            specialties: []
          });
        else this.getConditions();
      }
    );

  handleFocus = () =>
    this.setState(({ checkSpecializations, checkConditions }) => ({
      focus: true,
      checkConditions: false,
      checkSymptoms: true,
      checkSpecializations: false,
      pastChecked: checkSpecializations
        ? "checkSpecializations"
        : checkConditions
        ? "checkConditions"
        : "checkSymptoms"
    }));

  handleBlur = () =>
    this.setState(({ pastChecked, specialties }) => ({
      focus: false,
      checkConditions: pastChecked === "checkConditions",
      checkSymptoms: pastChecked === "checkSymptoms",
      checkSpecializations: pastChecked === "checkSpecializations" && specialties.length
    }));

  closeDetails = () =>
    this.setState({
      openDetails: false,
      specialties: [],
      checkConditions: true,
      checkSpecializations: false,
      checkSymptoms: false
    });

  conditionFocus = (detailsBackgroundColor, conditionFocused) =>
    this.setState(
      {
        checkConditions: false,
        checkSpecializations: true,
        openDetails: true,
        detailsBackgroundColor,
        conditionFocused
      },
      _ =>
        searchRequest
          .get(`triage_specialty?conditions=${conditionFocused.condition_id}`)
          .then(({ data }) =>
            this.setState({
              specialties: data.slice(0, 3).some(({ name }) => name === "Primary Care Physician")
                ? [
                    ...data.slice(0, 3).filter(e => e.name !== "Primary Care Physician"),
                    ...data.slice(0, 3).filter(e => e.name === "Primary Care Physician")
                  ]
                : [
                    ...data.slice(0, 2),
                    {
                      description: "first contact for an undiagnosed medical condition",
                      keywords:
                        "adult and pediatric medicine, preventive care, wellness, prevention, primary health",
                      name: "Primary Care Physician"
                    }
                  ]
            })
          )
    );

  colorSetter = () => {
    const { detailsBackgroundColor } = this.state;
    return detailsBackgroundColor === "#ef4f5e"
      ? "#3b305b"
      : detailsBackgroundColor === "#629896"
      ? "#7b335a"
      : detailsBackgroundColor === "#fecd5f"
      ? "#3b305b"
      : null;
  };

  render() {
    const {
      focus,
      checkSymptoms,
      checkConditions,
      checkSpecializations,
      specialties,
      symptom,
      openDetails,
      detailsBackgroundColor,
      condition,
      lat,
      lng,
      conditionFocused: { name, sub_symptoms, treatment, workup, medical_tests, videos }
    } = this.state;
    return (
      <main className="chatbot">
        <div id="tabs" onClick={e => e.preventDefault()}>
          <div>
            <input type="radio" name="tabs" id="symptomsTab" checked={checkSymptoms} readOnly />
            <label htmlFor="symptomsTab">SYMPTOMS</label>
            <input type="radio" name="tabs" id="conditionsTab" checked={checkConditions} readOnly />
            <label htmlFor="conditionsTab">CONDITIONS</label>
            <input
              type="radio"
              name="tabs"
              id="specializationsTab"
              checked={checkSpecializations}
              readOnly
            />
            <label htmlFor="specializationsTab">SPECIALIZATIONS</label>
            <div id="tabSlider" />
          </div>
        </div>
        <div id="wrapper-div">
          <div className="chatbot-card" id="symptoms">
            <img src="/img/card1_topart-02.png" alt="Your symptoms" />
            <div style={{ marginTop: "auto", height: isLarge ? 222 : 152 }}>
              <Autocomplete
                autoFocus
                setValueOnClick={false}
                readOnly={symptom.length === 6}
                getData={getSymptoms}
                placeholder={
                  symptom.length < 6 ? "Enter your symptoms here" : "Max number of symptoms entered"
                }
                strainer={symptom}
                handleClick={this.handleSymptoms}
                style={{
                  height: isLarge ? 60 : 46,
                  borderRadius: isLarge
                    ? focus
                      ? "30px 30px 0 0"
                      : 30
                    : focus
                    ? "23px 23px 0 0"
                    : 23
                }}
              />
              {symptom && symptom.length > 0 && (
                <div
                  style={{
                    width: "80%",
                    margin: "10px auto 0px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "spaceBetween"
                  }}>
                  {symptom.map(({ value, id }, i) => (
                    <Tooltip title={value} key={id}>
                      <Chip
                        {...(isLarge && { style: { height: 60, borderRadius: 30 } })}
                        label={value}
                        onDelete={() => this.handleRemove(i)}
                      />
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="chatbot-card" id="conditions">
            <Grid container spacing={1}>
              {condition && condition.length > 0 ? (
                <Fragment>
                  <Grid item xs={12}>
                    <Paper
                      style={{ backgroundColor: "#3b305B" }}
                      onClick={e => this.conditionFocus("#3b305B", condition[0])}>
                      <div className="conditions-grid-text condition-name">{condition[0].name}</div>
                      <div className="click-to-expand">
                        <span>CLICK TO EXPAND</span>
                      </div>
                      <div className="conditions-grid-text condition-subsymptoms">
                        <div className="title">DETAILS:</div>
                        <div>
                          {condition[0].sub_symptoms.length > 360
                            ? condition[0].sub_symptoms.slice(0, 360) + "..."
                            : condition[0].sub_symptoms}
                        </div>
                      </div>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      style={{ backgroundColor: "#7b335a" }}
                      onClick={e => this.conditionFocus("#7b335a", condition[1])}>
                      <div className="conditions-grid-text condition-name" style={{ fontSize: 23 }}>
                        {condition[1].name}
                      </div>
                      <hr />
                      <div className="conditions-grid-text condition-subsymptoms">
                        <div className="title">DETAILS:</div>
                        <div>
                          {" "}
                          {condition[1].sub_symptoms.length > 150
                            ? condition[1].sub_symptoms.slice(0, 150) + "..."
                            : condition[1].sub_symptoms}
                        </div>
                      </div>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper
                      style={{ backgroundColor: "#ef4f5e", color: "#3b305b" }}
                      onClick={e => this.conditionFocus("#ef4f5e", condition[2])}>
                      <div
                        className="conditions-grid-text condition-name"
                        style={{ color: "#3b305b", fontSize: 18 }}>
                        {condition[2].name}
                      </div>
                      <hr style={{ borderColor: "#3b305b" }} />
                      <div
                        className="conditions-grid-text condition-subsymptoms"
                        style={{ color: "#3b305b" }}>
                        <div className="title">DETAILS:</div>
                        <div>
                          {condition[2].sub_symptoms.length > 53
                            ? condition[2].sub_symptoms.slice(0, 53) + "..."
                            : condition[2].sub_symptoms}
                        </div>
                      </div>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Grid container direction="column" spacing={1}>
                      <Grid item>
                        <Paper
                          style={{ backgroundColor: "#629896" }}
                          onClick={e => this.conditionFocus("#629896", condition[3])}>
                          <div
                            className="conditions-grid-text condition-name"
                            style={{ color: "#7b335a", fontSize: 15 }}>
                            {condition[3].name}
                          </div>
                          <hr style={{ borderColor: "#7b335a" }} />
                        </Paper>
                      </Grid>
                      <Grid item>
                        <Paper
                          style={{ backgroundColor: "#fecd5f" }}
                          onClick={e => this.conditionFocus("#fecd5f", condition[4])}>
                          <div
                            className="conditions-grid-text condition-name"
                            style={{ color: "#3b305b", fontSize: 14 }}>
                            {condition[4].name}
                          </div>
                          <hr style={{ borderColor: "#3b305b" }} />
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                </Fragment>
              ) : (
                <Fragment>
                  <Grid item xs={12}>
                    <Paper style={{ backgroundColor: "#3b305B" }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Paper style={{ backgroundColor: "#7b335a" }} />
                  </Grid>
                  <Grid item xs={3}>
                    <Paper style={{ backgroundColor: "#ef4f5e", color: "#3b305b" }} />
                  </Grid>
                  <Grid item xs={3}>
                    <Grid container direction="column" spacing={1}>
                      <Grid item>
                        <Paper style={{ backgroundColor: "#629896" }} />
                      </Grid>
                      <Grid item>
                        <Paper style={{ backgroundColor: "#fecd5f" }} />
                      </Grid>
                    </Grid>
                  </Grid>
                </Fragment>
              )}
            </Grid>
            {openDetails && (
              <Zoom in={openDetails}>
                <Paper
                  elevation={4}
                  className="condition-details"
                  style={{ backgroundColor: detailsBackgroundColor }}>
                  <i
                    className="material-icons close-button"
                    onClick={this.closeDetails}
                    style={{ color: this.colorSetter() }}>
                    close
                  </i>
                  <div className="condition-details-content-wrapper">
                    <h4 style={{ color: this.colorSetter() }}>{name}</h4>
                    <hr style={{ borderColor: this.colorSetter() }} />
                    <div
                      className="condition-details-content"
                      style={{ height: window.innerHeight - 266 }}>
                      {sub_symptoms && (
                        <div>
                          <h5 style={{ color: this.colorSetter() }}>Sub Symptoms</h5>
                          <div style={{ color: this.colorSetter() }}>{sub_symptoms}</div>
                        </div>
                      )}
                      {treatment && (
                        <div>
                          <h5 style={{ color: this.colorSetter() }}>Treatment</h5>
                          <div style={{ color: this.colorSetter() }}>{treatment}</div>
                        </div>
                      )}
                      {workup && (
                        <div>
                          <h5 style={{ color: this.colorSetter() }}>Workup</h5>
                          <div style={{ color: this.colorSetter() }}>{workup}</div>
                        </div>
                      )}
                      {medical_tests && (
                        <div>
                          <h5 style={{ color: this.colorSetter() }}>Tests</h5>
                          <div style={{ color: this.colorSetter() }}>{medical_tests}</div>
                        </div>
                      )}
                      {videos && videos.length > 0 && (
                        <div>
                          <h5 style={{ color: this.colorSetter() }}>Videos</h5>
                          <div style={{ color: this.colorSetter() }}>
                            <ul>
                              {videos.map(({ player_links, title }, i) => (
                                <li key={i}>
                                  <a
                                    style={{ color: this.colorSetter() }}
                                    href={player_links}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    {title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    <hr style={{ borderColor: this.colorSetter() }} />
                  </div>
                </Paper>
              </Zoom>
            )}
          </div>
          <div className="chatbot-card" id="specialties">
            {lat && lng ? (
              <div id="map" />
            ) : (
              !specialties.length && (
                <div style={{ margin: "auto" }}>
                  Sorry, we haven't been able to track your location.
                </div>
              )
            )}
            {specialties && specialties.length > 0 && (
              <Slide in={specialties.length > 0} direction="right" timeout={300}>
                <div className="specialty-list">
                  {specialties.map(({ name, description, ID }, i) => (
                    <div
                      key={ID + i}
                      className="specialty-wrapper-balloon"
                      onClick={() =>
                        window.open(
                          `${window.location.origin}/search?q=${encodeURIComponent(
                            name
                          )}&lat=${lat}&lng=${lng}&type=specialty`
                        )
                      }>
                      <i className="material-icons balloon">place</i>
                      <div
                        className="specialty-wrapper"
                        style={{
                          backgroundColor:
                            i === 0
                              ? "#7b335a"
                              : i === 1
                              ? "#ef4f5e"
                              : i === 2
                              ? "#629896"
                              : "#7b335a"
                        }}>
                        <div className="specialty-name">
                          {name.length > 35
                            ? name.slice(0, 35).toUpperCase() + "..."
                            : name.toUpperCase()}
                        </div>
                        <div className="specialty-description">{description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Slide>
            )}
          </div>
        </div>
      </main>
    );
  }
}

export default Chatbot;
