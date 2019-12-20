import React, { Component } from "react";
import { IconButton, Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import { Profile, Booking, SearchWrapper, Zoom } from "../";
import {
  debounce,
  searchRequest,
  careTeamRequest,
  isPatient,
  bookingRequest,
  getAuth,
  defaultLat,
  defaultLng,
  getCenter,
  SearchContext,
  handlePromise,
  handleFromTo,
  GlobalContext
} from "../../utils";
import { handleDoctors, handleInsurance, handleMarkers, handleTeamDoctors } from "./utils";
import { ADD_PAGE, EXTENDED } from "./utils";
import "./style.css";

class Search extends Component {
  constructor(props) {
    super(props);
    const { lat, lng } = localStorage,
      params = {
        lat: parseFloat(lat) || defaultLat,
        lng: parseFloat(lng) || defaultLng,
        ins: "",
        gender: "",
        from: "",
        language: "",
        pg: 1,
        q: "",
        type: "name"
      },
      { search } = window.location;
    if (search) {
      const searchURL = new URLSearchParams(search);
      for (let i in params) {
        let param = searchURL.get(i);
        if (param) {
          switch (i) {
            case "lat":
            case "lng":
              params[i] = parseFloat(param);
              break;
            case "from":
              params[i] = new Date(decodeURI(`${param} UTC`));
              break;
            case "pg":
              params[i] = parseInt(param);
              break;
            default:
              params[i] = param;
              break;
          }
        }
      }
    }
    this.state = {
      params,
      doctors: [],
      careTeam: [],
      isCareTeam: !!props.isCareTeam,
      doctorsLoading: false,
      map: null,
      selectedDoctor: undefined,
      openProfile: false,
      slot: {},
      appointmentFilter: "",
      bookingOpened: false,
      place: "",
      highlightedDoctor: undefined
    };
    this.setSnackbar = this.props.setSnackbar;
  }

  handleCareTeam = state => {
    if (isPatient())
      return this.handleLoading(
        _ =>
          careTeamRequest.get("list").then(({ data }) =>
            this.setState(({ doctors, careTeam }) => {
              if (window.location.hash) window.location.hash = "";
              for (let i = 0; i < careTeam.length; i++)
                if (careTeam[i].marker) careTeam[i].marker.setMap(null);
              return {
                careTeam: data.length
                  ? handleTeamDoctors(this.handleMapMarkers(this.handleData()(data)), data)
                  : [],
                ...(doctors.length && { doctors: handleTeamDoctors(doctors, data) })
              };
            })
          ),
        state
      ).then(_ => this.state.careTeam);
  };

  newSearch = extended =>
    this.thenState(({ params, doctors, extendedName, hasSearch, isCareTeam, map }) => {
      // if (!extended)
      for (let i = 0; i < doctors.length; i++)
        if (doctors[i].marker) doctors[i].marker.setMap(null);
      let notExtended = extendedName && !extended,
        type = notExtended
          ? "name"
          : params.type; /*,
        d
      if (type === "name") d = "25000mi";
      else {
        const { geometry, LatLng } = window.google.maps,
          center = map.getCenter(),
          { lat, lng } = center.toJSON(),
          { east, north } = map.getBounds().toJSON(),
          min = Math.min(north - lat, east - lng);
        d = `${Number(
          (
            geometry.spherical.computeDistanceBetween(
              center,
              new LatLng(min === north - lat ? { lng, lat: north } : { lng: east, lat })
            ) * 0.000621371
          ).toFixed(2)
        ) || 10}mi`;
      }*/
      return {
        params: { ...params, type, pg: 1, ...(notExtended && { q: extendedName }) },
        ...(isCareTeam && hasSearch && { isCareTeam: false }),
        ...(!extended && { doctors: [], end: false })
      };
    }).then(_ => this.handleSearch(extended));

  handleSearch = meta => {
    const { params, map } = this.state;
    let query = { ...params },
      { pg, type, ins, from, lat, lng } = query,
      searchString = "doctor?";
    if (from)
      query = {
        ...query,
        ...handleFromTo(query.from, new Date(query.from)),
        date_only: true
      };
    console.log(query);
    for (let i in query) if (query[i]) searchString += `&${i}=${query[i]}`;
    if (map) {
      let center = getCenter(map);
      if (lat && lng && (center.lat !== lat || center.lng !== lng)) map.panTo({ lat, lng });
    }
    return this.handleLoading(_ =>
      searchRequest.get(searchString).then(({ data }) => {
        let extend = meta !== EXTENDED && data.length < 5 && type === "name";
        this.thenState(({ doctors, params, careTeam, hasSearch, appointmentFilter }) => {
          let list,
            newDoctors = data.filter(({ ID, count_video, count_in_person }) => {
              if (
                query.from &&
                ((appointmentFilter === "In person" && !count_in_person) ||
                  (appointmentFilter === "Video" && !count_video))
              )
                return false;
              for (let i = 0; i < doctors.length; i++) if (doctors[i].ID === ID) return false;
              return true;
            });
          if (meta === ADD_PAGE) list = [...doctors, ...this.handleData()(newDoctors)];
          else if (meta === EXTENDED) {
            let extendedDoctors = this.handleData()(newDoctors);
            if (extendedDoctors[0] && doctors[0])
              extendedDoctors[0].separator = `<i class="fas fa-stethoscope"></i>Additional ${
                doctors[0].mainSpecialty.toLowerCase().split(" (")[0]
              }s`;
            list = [...doctors, ...extendedDoctors];
          } else list = this.handleData()(newDoctors);
          let result = this.handleMapMarkers(list),
            first = result[0];
          return {
            doctors:
              !meta && doctors.length && !data.length ? [] : ins ? handleInsurance(result) : result,
            ...(extend && {
              params: {
                ...params,
                ...(first && { q: first.mainSpecialty, type: "specialty" })
              },
              extendedName: first && first.name.slice(4)
            }),
            ...(!hasSearch && { hasSearch: true }),
            ...(!extend && pg > 1 && data.length < 5 && { end: true })
          };
        }).then(_ => {
          if (extend && !localStorage.idToAdd) this.newSearch(EXTENDED);
        });
      })
    );
  };

  handleScroll = debounce(_ => {
    const { scrollTop, clientHeight, scrollHeight } = document.querySelector(".results"),
      { doctorsLoading, end, isCareTeam } = this.state;
    if (
      scrollHeight - scrollTop - clientHeight < clientHeight &&
      !doctorsLoading &&
      !end &&
      !isCareTeam
    )
      this.thenState(({ params: { pg, ...rest } }) => ({
        params: { pg: pg + 1, ...rest }
      })).then(_ => this.handleSearch(ADD_PAGE));
  });

  render() {
    const {
        state: {
          params: { from, gender, q, language, ins, lat, lng },
          doctors,
          map,
          selectedDoctor,
          slot,
          appointmentFilter,
          openProfile,
          doctorsLoading,
          bookingOpened,
          careTeam,
          isCareTeam,
          hasSearch,
          place,
          highlightedDoctor
        },
        setParam,
        setSnackbar,
        setSlot,
        clearParam,
        setMap,
        handleScroll,
        toggleDoctor,
        openDoctor,
        newSearch,
        handleClose,
        handleAppointmentFilter,
        clearAppointmentFilter,
        handleBooking,
        toggleCareTeam,
        setCareTeam,
        handleReviews,
        highlightDoctor
      } = this,
      { picture, name, mainSpecialty, rate } = selectedDoctor || {};
    return (
      <SearchContext.Provider
        value={{
          highlightDoctor,
          setCareTeam,
          hasSearch,
          handleBooking,
          handleClose,
          gender,
          q,
          language,
          ins,
          setParam: debounce(setParam),
          clearParam,
          date: from,
          selectedDoctor,
          slot,
          setSlot,
          toggleDoctor,
          lat,
          lng,
          map,
          setMap,
          list: isCareTeam ? careTeam : doctors,
          handleScroll,
          doctorsLoading,
          openDoctor,
          appointmentFilter,
          setSnackbar,
          careTeam,
          isCareTeam,
          highlightedDoctor
        }}>
        <SearchWrapper
          {...{
            newSearch,
            handleAppointmentFilter,
            clearAppointmentFilter,
            toggleCareTeam,
            place
          }}
        />
        {openProfile && ( //rendering control for useScroll
          <Profile {...{ selectedDoctor, openProfile, handleClose, setCareTeam, handleReviews }} />
        )}
        {bookingOpened && (
          <Dialog
            open={bookingOpened}
            TransitionComponent={Zoom}
            onClose={handleClose}
            disableEscapeKeyDown
            disableBackdropClick
            classes={{ paper: "booking-dialog" }}>
            <DialogTitle disableTypography className="dialog-title">
              <div>Book an appointment</div>
              <IconButton
                onClick={handleClose}
                children={<i className="material-icons">close</i>}
              />
            </DialogTitle>
            <DialogContent className="dialog-booking scrollbar">
              <div className="doctor">
                <img src={picture} alt={name} height="100" width="100" />
                <div className="doctor-id">
                  <div>{name}</div>
                  <div>{mainSpecialty}</div>
                  <div>{rate}</div>
                </div>
              </div>
              <Booking />
            </DialogContent>
          </Dialog>
        )}
      </SearchContext.Provider>
    );
  }

  openPatientCalendar = _ => window.open("/patient-calendar");

  setMap = map =>
    this.thenState({ map })
      .then(this.newSearch)
      .then(_ => {
        const { idToAdd, nameToAdd } = localStorage;
        if (idToAdd && getAuth()) {
          const intId = parseInt(idToAdd);
          this.openDoctor(intId)
            .then(this.handleCareTeam)
            .then((careTeam = []) => {
              for (let i = 0; i < careTeam.length; i++) if (careTeam[i].ID === intId) return;
              if (isPatient()) return this.setCareTeam("add", intId, nameToAdd)();
            })
            .then(_ => ["idToAdd", "nameToAdd"].forEach(e => localStorage.removeItem(e)));
        } else this.handleCareTeam();
      });

  setParam = (param, fromChange) =>
    this.thenState(({ params, extendedName }) => ({
      params: { ...params, ...param },
      ...(typeof param.q === "string" && extendedName !== param.q && { extendedName: null })
    })).then(_ => {
      if (!fromChange) this.newSearch();
    });

  clearParam = param => _ => this.setParam({ [param]: "" });

  handleAppointmentFilter = ({ target: { value } }) =>
    this.thenState({ appointmentFilter: value }).then(_ => {
      if (this.state.params.from) this.newSearch();
    });

  clearAppointmentFilter = _ => this.handleAppointmentFilter({ target: { value: "" } });

  handleLoading = (promise, state) =>
    this.thenState({ doctorsLoading: true, ...state })
      .then(promise)
      .then(_ => this.thenState({ doctorsLoading: false }));

  handleReviews = (reviewsDone, reviews = []) =>
    this.setState(({ selectedDoctor, isCareTeam, ...state }) => {
      const a = isCareTeam ? "careTeam" : "doctors";
      for (let i = 0; i < state[a].length; i++)
        if (state[a][i].ID === selectedDoctor.ID)
          return {
            selectedDoctor: {
              ...selectedDoctor,
              reviews: [...selectedDoctor.reviews, ...reviews],
              reviewsDone
            },
            [a]: [
              ...state[a].slice(0, i),
              { ...state[a][i], reviews: [...state[a][i].reviews, ...reviews], reviewsDone },
              ...state[a].slice(i + 1)
            ]
          };
    });

  handleData = _ => {
    const {
      params: { type, q }
    } = this.state;
    return handleDoctors(type, q);
  };

  handleMapMarkers = doctors => {
    const {
      highlightDoctor,
      openDoctor,
      state: { map }
    } = this;
    return handleMarkers({ map, highlightDoctor, openDoctor, doctors });
  };

  thenState = state => new Promise(resolve => this.setState(state, resolve));

  selectDoctor = ID =>
    this.thenState(({ doctors, careTeam }) => {
      if (ID) {
        let list = doctors.concat(careTeam);
        for (let i = 0; i < list.length; i++)
          if (list[i].ID === ID) {
            let { type, separator, marker, gender, out_of_network, ...selectedDoctor } = list[i];
            return { selectedDoctor };
          }
      } else return { selectedDoctor: undefined };
    });

  openDoctor = doctor => this.selectDoctor(doctor).then(_ => this.thenState({ openProfile: true }));

  handleBooking = doctor =>
    this.selectDoctor(doctor).then(_ => this.thenState({ bookingOpened: true }));

  handleClose = ({ setState }) =>
    (this.state.slot.ID ? bookingRequest.post("remove_reserve") : Promise.resolve(null)).then(_ =>
      this.setState({
        bookingOpened: false,
        openProfile: false,
        slot: {},
        selectedDoctor: undefined,
        ...setState
      })
    );

  highlightDoctor = highlightedDoctor => this.setState({ highlightedDoctor });

  setSlot = slot => this.setState({ slot });

  toggleCareTeam = _ => {
    if (isPatient()) {
      if (this.state.isCareTeam) this.setState({ isCareTeam: false });
      else this.handleCareTeam({ isCareTeam: true });
    } else this.setSnackbar({ message: "Please login first." });
  };

  setCareTeam = (action, ID, name, toggle) => _ => {
    if (isPatient()) {
      const isAdd = action === "add";
      handlePromise(
        this.handleLoading(_ =>
          careTeamRequest({
            method: isAdd ? "POST" : "DELETE",
            url: action,
            data: { doctor_id: ID }
          })
            .then(_ => {
              this.setSnackbar({
                message: `You ${isAdd ? "add" : "remov"}ed ${name} ${
                  isAdd ? "to" : "from"
                } your Care Team.`,
                type: isAdd ? 1 : 0
              });
              return this.thenState(({ selectedDoctor }) => ({
                ...(selectedDoctor &&
                  selectedDoctor.ID === ID && {
                    selectedDoctor: { ...selectedDoctor, inCareTeam: action === "add" }
                  })
              }));
            })
            .then(this.handleCareTeam)
        ),
        toggle
      );
    } else this.setSnackbar({ message: "Please login first." });
  };
}

const _Search = _ => (
  <GlobalContext.Consumer>
    {({ setSnackbar }) => <Search {...{ setSnackbar }} />}
  </GlobalContext.Consumer>
);

export default _Search;
