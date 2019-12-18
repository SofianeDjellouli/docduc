import React, { memo, useState, useEffect, useCallback, useContext, Fragment } from "react";
import { Chip } from "@material-ui/core";
import {
  useToggle,
  handlePromise,
  GlobalContext,
  SearchContext,
  STRIPE_KEY,
  isDev,
  formatPrice,
  debounce,
  appointmentsRequest,
  searchRequest,
  uploadFile,
  baseAuthRequest,
  handleFile,
  bookingRequest
} from "../../utils";
import { SlotPicker, Autocomplete, Spinner, Filter, Tooltip } from "../";
import { initialCost, initialForm } from "./utils";
import "./style.css";

const _Booking = _ => {
  const { setSnackbar } = useContext(GlobalContext),
    {
      slot: { startTime, startTimeDate, ID, typeID, weekday, endTime } = {},
      selectedDoctor = {},
      handleClose
    } = useContext(SearchContext),
    { picture, fullAddress, name } = selectedDoctor,
    [{ price, fee, service_fee }, setCost] = useState(initialCost),
    toggleLoading = useToggle(),
    [{ note, files, symptoms }, setForm] = useState(initialForm),
    filter = document.querySelector(".booking .filter-wrapper"),
    filterStyle = {
      position: "fixed",
      padding: 0,
      border: "none",
      zIndex: 2,
      right: window.innerWidth - (filter && filter.getBoundingClientRect().right)
    },
    handleNote = useCallback(
      ({ target: { value } }) => setForm(form => ({ ...form, note: value })),
      []
    ),
    handleFiles = useCallback(
      e => handleFile(e).then(file => setForm(form => ({ ...form, files: [...form.files, file] }))),
      []
    ),
    removeFile = useCallback(
      ({
        currentTarget: {
          dataset: { i }
        }
      }) =>
        setForm(({ files, ...form }) => {
          let _files = [...files];
          _files.splice(i, 1);
          return { ...form, files: _files };
        }),
      []
    ),
    addSymptom = useCallback(
      ({ id, value }) => {
        for (let i = 0; i < symptoms.length; i++)
          if (symptoms[i].id.toString() === id) return setSnackbar("Already picked");
        setForm(({ symptoms, ...form }) => ({ ...form, symptoms: [...symptoms, { id, value }] }));
      },
      [symptoms, setSnackbar]
    ),
    removeSymptom = useCallback(
      i => _ =>
        setForm(({ symptoms, ...form }) => {
          let _symptoms = [...symptoms];
          _symptoms.splice(i, 1);
          return { ...form, symptoms: _symptoms };
        }),
      []
    ),
    getSymptoms = useCallback(
      debounce(value =>
        searchRequest.get(`symptom?q=${value}`).then(({ data }) => {
          if (data.length)
            return data
              .filter(({ id }) => {
                for (let i = 0; i < symptoms.length; i++) if (symptoms[i].id === id) return false;
                return true;
              })
              .map(({ name, id }) => ({ value: name, id }));
          return [];
        })
      ),
      [symptoms]
    ),
    handleReserve = useCallback(
      _ =>
        bookingRequest
          .post("remove_reserve", null)
          .then(_ => bookingRequest.post("reserve", { appointmentID: ID })),
      [ID]
    ),
    handlePayment = useCallback(
      _ =>
        handlePromise(
          new Promise((resolve, reject) => {
            if (window.StripeCheckout) resolve();
            else {
              let script = document.createElement("script");
              script.src = "https://checkout.stripe.com/checkout.js";
              script.async = true;
              script.defer = true;
              window.document.body.appendChild(script);
              script.addEventListener("load", resolve);
              script.addEventListener("error", reject);
            }
          }).then(
            _ =>
              new Promise(resolve => {
                let clickClose = true;
                return window.StripeCheckout.open({
                  name: "Docduc Health",
                  description: name,
                  image: picture,
                  amount: price + service_fee + fee,
                  key: STRIPE_KEY,
                  locale: "auto",
                  email: localStorage.email,
                  opened: resolve,
                  closed: _ => {
                    if (clickClose) handleReserve();
                  },
                  token: ({ id }) => {
                    clickClose = false;
                    handlePromise(
                      baseAuthRequest
                        .post("make_appointment_payment", {
                          ...(id && { token: id }),
                          appointment_id: ID,
                          save_user: true
                        })
                        .then(_ =>
                          handleClose({
                            setState: {
                              snackbar: { message: "Your appointment has been booked.", type: 2 }
                            }
                          })
                        ),
                      toggleLoading.toggle
                    );
                  }
                });
              })
          ),
          toggleLoading.toggle
        ),
      [ID, handleClose, handleReserve, toggleLoading.toggle, fee, price, service_fee, name, picture]
    ),
    handleBooking = useCallback(
      ({ type, id }) => {
        let symptoms_ids = symptoms.map(e => parseInt(e.id));
        if (!ID) return setSnackbar("Please select a slot first.");
        else if (!symptoms_ids.length) return setSnackbar("Please enter your symptoms");
        else if (!note) return setSnackbar("Please write a reason for visit");
        else
          Promise.all(
            files.map(({ name, file }) =>
              handlePromise(uploadFile(name, file), toggleLoading.toggle)
            )
          )
            .then(data =>
              handlePromise(
                bookingRequest.post("appointment", {
                  appointmentID: ID,
                  symptoms_ids,
                  note,
                  ...(data.length &&
                    data[0] && { file_link: data.map(({ data: { file } }) => file) })
                }),
                toggleLoading.toggle
              )
            )
            .then(_ =>
              price || service_fee
                ? handlePayment()
                : handlePromise(
                    baseAuthRequest.post("make_appointment_payment", { appointment_id: ID }),
                    toggleLoading.toggle
                  ).then(_ =>
                    handleClose({
                      setState: {
                        snackbar: { message: "Your appointment has been booked.", type: 2 }
                      }
                    })
                  )
            )

            .catch(handleReserve);
      },
      [
        handlePayment,
        handleClose,
        handleReserve,
        ID,
        symptoms,
        note,
        files,
        toggleLoading.toggle,
        setSnackbar,
        price,
        service_fee
      ]
    ),
    handleUnload = useCallback(e => {
      if (!isDev) {
        e.preventDefault();
        e.returnValue = "returned";
        return "returned";
      }
    }, []);

  useEffect(
    _ => {
      if (ID)
        handlePromise(
          handleReserve()
            .then(_ => appointmentsRequest.get(`price/${ID}`))
            .then(({ data: { price, fee, service_fee } = {} }) =>
              setCost({ price, fee, service_fee })
            ),
          toggleLoading.toggle
        );
    },
    [ID, toggleLoading.toggle, handleReserve]
  );

  useEffect(
    _ => {
      window.addEventListener("beforeunload", handleUnload);
      return _ => window.removeEventListener("beforeunload", handleUnload);
    },
    [handleUnload]
  );

  return (
    <form /*{...{ style }}*/ className="booking">
      {toggleLoading.toggled && Spinner(80)}
      {ID ? (
        <div className="appointment">
          <div>
            <div>
              <i className={`fas fa-${typeID === 1 ? "user" : "video"}`} />
              {`${typeID === 1 ? "In person" : "Video"} appointment`}
            </div>
            <div>
              <i className="fas fa-clock" />
              {`${weekday}, ${startTimeDate}, ${startTime} - ${endTime}`}
            </div>
            <div>
              <i className="fas fa-map-marker" />
              {fullAddress}
            </div>
          </div>
          <Filter placeholder="Edit" style={filterStyle} close={ID}>
            <SlotPicker isPopup ID={selectedDoctor.ID} />
          </Filter>
        </div>
      ) : (
        <div className="flex-center">
          <SlotPicker ID={selectedDoctor.ID} />
        </div>
      )}
      <Autocomplete
        placeholder="What are your symptoms?"
        setValueOnClick={false}
        getData={getSymptoms}
        handleClick={addSymptom}
      />
      {symptoms.length > 0 && (
        <div className="symptoms-list">
          {symptoms.map(({ value }, i) => (
            <Chip
              className="chip"
              color="primary"
              key={value}
              label={value}
              onDelete={removeSymptom(i)}
            />
          ))}
        </div>
      )}
      <textarea value={note} onChange={handleNote} placeholder="Reason for visit" />
      <label htmlFor="files" onDrop={handleFiles}>
        Attach files
        <input
          type="file"
          onChange={handleFiles}
          multiple
          id="files"
          accept="image/png,image/jpeg,image/jpg,application/pdf"
        />
      </label>
      {files.length > 0 && (
        <div className="files">
          {files.map(({ name }, i) => (
            <div key={name + i}>
              {name}
              <i onClick={removeFile} data-i={i} className="fas fa-times-circle" />
            </div>
          ))}
        </div>
      )}
      {price > 0 && (
        <Fragment>
          <hr />
          <div className="price-title">Appointment fees</div>
          <div className="price">
            <div>
              <div>
                Booking fee
                <Tooltip
                  title="Applied to copay"
                  children={<i className="fas fa-question-circle" />}
                />
              </div>
              <div>{formatPrice(price)}</div>
            </div>
            <div>
              <div>
                Platform fee
                <Tooltip
                  title={
                    <div>
                      <div>Payment fee: {formatPrice(fee)}</div>
                      <div>Service fee: {formatPrice(service_fee)}</div>
                      <br />
                      <div>This service fee helps us operate Docduc health.</div>
                    </div>
                  }
                  children={<i className="fas fa-question-circle" />}
                />
              </div>
              <div>{formatPrice(fee + service_fee)}</div>
            </div>
            <hr className="no-margin" />
            <div>
              <div>Total</div>
              <div>{formatPrice(price + fee + service_fee)}</div>
            </div>
          </div>
        </Fragment>
      )}
      <div className="flex-center">
        <button onClick={handleBooking} className="softo-solid-btn" type="button">
          Book now
        </button>
      </div>
    </form>
  );
};

export const Booking = memo(_Booking);
