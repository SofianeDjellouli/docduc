import React, { useCallback, memo } from "react";
import { useToggle } from "../../utils";
import { Grid } from "@material-ui/core";
import { handleSubscribe } from "./utils";
import "./style.css";

const _PricingDoctor = _ => {
  const toggleMonthly = useToggle(),
    handleMonthly = useCallback(
      ({
        currentTarget: {
          dataset: { monthly }
        }
      }) => {
        if ((monthly === "true") !== toggleMonthly.toggled) toggleMonthly.toggle();
      },
      [toggleMonthly]
    );
  return (
    <Grid item sm={5} className="home-card pricing">
      <h3>Premium</h3>
      <div className="period">
        <div
          data-monthly="true"
          onClick={handleMonthly}
          {...(toggleMonthly.toggled && { className: "plan-active" })}>
          Monthly
        </div>
        <div
          data-monthly="false"
          onClick={handleMonthly}
          {...(!toggleMonthly.toggled && { className: "plan-active" })}>
          Yearly
        </div>
      </div>
      <div className="price">
        <i className="fas fa-dollar-sign right" />
        <span className="dollars">{`${toggleMonthly.toggled ? "3" : "2"}90.`}</span>
        <span className="cents">00</span>
      </div>
      <div>/ Month</div>
      <button className="softo-solid-btn" onClick={handleSubscribe}>
        Subscribe
      </button>
      {[
        "New patient acquisition",
        "Practice reputation marketing",
        "Patient panel analytics",
        "Personalized patient followup",
        "Automated copay collections",
        "Automated patient balance collections",
        "EHR integration",
        "Online appointment booking",
        "Secured video visits",
        "Secured patient messaging",
        "HIPAA compliant Web, iOS & Android apps",
        "Unlimited data storage"
      ].map(e => (
        <div key={e} className="feature">
          <i className="fas fa-check-circle right" />
          <span>{e}</span>
        </div>
      ))}
    </Grid>
  );
};

export const PricingDoctor = memo(_PricingDoctor);

export const PricingPatient = _ => (
  <Grid item sm={5} className="home-card pricing">
    <h3>Free</h3>
    <div>Docduc is free for patients.</div>
    <div className="price">
      <i className="fas fa-dollar-sign right" />
      <span className="dollars">0.</span>
      <span className="cents">00</span>
    </div>
    <div>/ Month</div>
    <button className="softo-solid-btn">Sign up</button>
  </Grid>
);
