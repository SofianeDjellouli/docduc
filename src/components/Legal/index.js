import React, { Fragment, useCallback } from "react";
import { navigate } from "hookrouter";
import { HIPAAAuthorization, PrivacyPolicy, TermsOfService } from "./documents";
import "../../style/tabs.css";
import "./style.css";

const Legal = ({ tab }) => {
  const handleTab = useCallback(({ target: { name } }) => navigate(`/legal/${name}`), []);

  return (
    <Fragment>
      <div className="tabs">
        <div>
          {["terms-of-service", "privacy-policy", "HIPAA-authorization"].map((e, i) => (
            <Fragment key={e}>
              <input
                type="radio"
                checked={tab === e}
                name={e}
                id={`tab${i}`}
                onChange={handleTab}
              />
              <label htmlFor={`tab${i}`}>{e.replace(/-/g, " ")}</label>
            </Fragment>
          ))}
          <div className="slider" />
        </div>
      </div>
      {(_ => {
        switch (tab) {
          case "HIPAA-authorization":
            document.title = "Docduc - HIPAA Authorization";
            return <HIPAAAuthorization />;
          case "privacy-policy":
            document.title = "Docduc - Privacy Policy";
            return <PrivacyPolicy />;
          case "terms-of-service":
            document.title = "Docduc - Terms of Service";
            return <TermsOfService />;
          default:
            document.title = "Docduc - Terms of Service";
            return <TermsOfService />;
        }
      })()}
    </Fragment>
  );
};

export default Legal;
