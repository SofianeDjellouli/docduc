import React, { useEffect, useState, useCallback, Fragment, useRef } from "react";
import { Dialog, DialogContent, IconButton } from "@material-ui/core";
import { SlotPicker, Booking, Spinner } from "../";
import {
  handlePromise,
  chatRequest,
  handleRating,
  isPatient,
  useScroll,
  baseRequest,
  useToggle
} from "../../utils";
import { PAGE_SIZE, TransitionComponent } from "./utils";
import "./style.css";

let page = 0;

export const Profile = ({
  selectedDoctor: {
    inCareTeam,
    name,
    city,
    state,
    practice,
    picture,
    fullAddress,
    aboutDescription,
    ID,
    rate,
    languages,
    insurances,
    specialties = [],
    reviews = [],
    reviewsDone
  } = {},
  openProfile,
  handleClose,
  setCareTeam,
  handleReviews
}) => {
  const [insurance, setInsurance] = useState(""),
    toggleLoading = useToggle(),
    // isMobile = UseMobile(),
    handleInsurance = useCallback(({ target: { value } }) => setInsurance(value), []),
    scrollReviews = useCallback(
      _ =>
        document.querySelector(".profile").scrollTo({
          top: document.querySelector(".reviews").offsetTop,
          behavior: "smooth"
        }),
      []
    ),
    // hideBooking = isMobile && !toggleBooking.toggled,
    handleCareTeam = useCallback(
      setCareTeam(inCareTeam ? "remove" : "add", ID, name, toggleLoading.toggle),
      [setCareTeam, inCareTeam, ID, toggleLoading.toggle, name]
    ),
    startConv = useCallback(
      _ =>
        handlePromise(
          chatRequest
            .post(`create-conversation/${ID}`)
            .then(({ data: { conversation_id } }) => window.open(`/chat#${conversation_id}`)),
          toggleLoading.toggle
        ),
      [toggleLoading.toggle, ID]
    ),
    getReviews = useCallback(
      _ =>
        reviewsDone
          ? Promise.resolve(null)
          : handlePromise(
              baseRequest.get(`reviews/${ID}/${page}/${PAGE_SIZE}`).then(({ data }) => {
                page++;
                handleReviews(
                  data.length < PAGE_SIZE,
                  data.map(({ date, ID, name, comment, rate }) => ({
                    date: new Date(date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    }),
                    ID,
                    name,
                    comment,
                    rate
                  }))
                );
                return [];
              }),
              toggleLoading.toggle
            ),
      [ID, toggleLoading.toggle, handleReviews, reviewsDone]
    ),
    ref = useRef(),
    reviewsRef = useRef(),
    { onScroll } = useScroll(
      ref,
      getReviews,
      toggleLoading.toggled || reviewsDone,
      reviewsRef.current && reviewsRef.current.offsetTop
    );

  useEffect(
    _ => {
      if (reviewsDone !== undefined) page = 0;
    },
    [reviewsDone]
  );

  return (
    <Dialog
      open={openProfile}
      onClose={handleClose}
      disableEscapeKeyDown
      disableBackdropClick
      classes={{ paper: "doctor-dialog" }}
      {...{ TransitionComponent }}>
      <IconButton
        className="close-button"
        onClick={handleClose}
        children={<i className="material-icons">close</i>}
      />
      <DialogContent className="dialog-profile">
        <div className="profile-wrapper">
          {toggleLoading.toggled && Spinner(80)}
          <div className="profile" {...{ onScroll, ref }}>
            <div className="card">
              <img src={picture} alt={name} height="150" width="150" />
              <div className="name">{name}</div>
              <div
                className="rate"
                {...(reviews.length && {
                  onClick: scrollReviews,
                  style: { cursor: "pointer" }
                })}>
                {rate}
              </div>
              <div>
                {city}, {state}
              </div>
              <div className="specialties">
                {specialties.length > 1 ? specialties.join(", ") : specialties[0]}
              </div>
            </div>
            <hr />
            <div className="title">Practice</div>
            <div className="practice">
              <i className="fas fa-map-marker right" />
              <div>
                <div>{practice}</div>
                <div>{fullAddress}</div>
              </div>
            </div>
            <hr />
            <div className="title">{`About ${name}`}</div>
            <div>{aboutDescription}</div>
            <div className="title">{`Specialt${specialties.length > 1 ? "ies" : "y"}`}</div>
            {specialties.map(e => (
              <div key={e}>{e}</div>
            ))}
            {languages && languages.length > 0 && (
              <Fragment>
                <div className="title">Spoken languages</div>
                <div>{languages}</div>
              </Fragment>
            )}
            {isPatient() && (
              <div className="add-to-team" onClick={handleCareTeam}>
                <i className={`fas fa-user-${inCareTeam ? "minus" : "plus"} right`} />
                {`${inCareTeam ? "Remove from" : "Add to"} my Care Team`}
              </div>
            )}
            <hr />
            <div className="title">Availabilities</div>
            <SlotPicker {...{ ID }} />
            {isPatient() && (
              <Fragment>
                <hr />
                <div className="flex-center">
                  <button onClick={startConv} className="softo-solid-btn">
                    <i className="fas fa-comments right" />
                    {`Start a conversation with ${name}`}
                  </button>
                </div>
              </Fragment>
            )}
            {insurances && insurances.length > 0 && (
              <Fragment>
                <hr />
                <div className="title">Accepted insurances</div>
                <input
                  value={insurance}
                  onChange={handleInsurance}
                  placeholder="Search for your insurance plan"
                />
                <div className="insurances">
                  {insurances
                    .filter(({ label }) => label.search(new RegExp(insurance, "i")) > -1)
                    .map(({ label, ID }) => (
                      <div key={ID}>{label}</div>
                    ))}
                </div>
              </Fragment>
            )}
            <hr />
            {reviews && reviews.length > 0 && (
              <Fragment>
                <div className="title reviews" ref={reviewsRef}>
                  Reviews
                </div>
                <div>
                  {reviews.map(({ date, ID, name, comment, rate }) => (
                    <div key={ID} className="review">
                      <div>{handleRating(rate)}</div>
                      <div>{comment} </div>
                      <div>
                        {date} - {name}
                      </div>
                      <hr />
                    </div>
                  ))}
                </div>
              </Fragment>
            )}
          </div>
        </div>
        {/*hideBooking && <div onClick={toggleBooking.toggle}>Book</div>*/}
        {isPatient() && (
          <div className="booking-wrapper">
            <div className="title">Book an appointment</div>
            <Booking /*{...(hideBooking && { style: { display: "none" } })}*/ />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
