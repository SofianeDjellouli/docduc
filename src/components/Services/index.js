import React, { memo, Fragment } from "react";
import { Tooltip } from "../";
import { Chip } from "@material-ui/core";
import "./style.css";

const _Services = ({ services }) => (
  <div>
    {services &&
      services.map(
        (
          {
            diagnoses,
            service_сode, //Russian "c" for getting
            service_code, //Normal "c" for posting
            service_description,
            price,
            payment_type,
            insurance_type,
            status
          },
          i
        ) => {
          const hasPrice = Boolean(price),
            code = service_сode || service_code,
            priceFormat = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD"
            }).format(price / 100);
          return (
            <Tooltip
              key={code + i}
              type={1}
              title={
                <div className="services-tooltip">
                  <div className="title-modal">{`Diagnos${diagnoses.length > 1 ? "e" : "i"}s`}</div>
                  <div className="wrap">
                    {diagnoses &&
                      diagnoses.map(({ description, code }, i) => (
                        <div className="code" key={code + i}>
                          {code} - {description}
                        </div>
                      ))}
                  </div>
                  <hr />
                  <div className="title-modal">Service</div>
                  <div>{`${code} - ${service_description}`}</div>
                  <hr />
                  {hasPrice && (
                    <Fragment>
                      <div className="title-modal">Price</div>
                      {priceFormat}
                      <hr />
                    </Fragment>
                  )}
                  <div className="title-modal">Charge</div>
                  {hasPrice ? ["Immediately", "6 months", "12 months"][payment_type] : "No charge"}
                  <hr />
                  {hasPrice && (
                    <Fragment>
                      <div className="title-modal">Insurance</div>
                      {["In network", "Assignment", "Cash only"][insurance_type]}
                      <hr />
                      {(status || status === 0) && (
                        <Fragment>
                          <div className="title-modal">Payment status</div>
                          {["Pending", "In progress", "Payed"][status]}
                        </Fragment>
                      )}
                    </Fragment>
                  )}
                </div>
              }>
              <Chip
                color="primary"
                label={`${code} - ${
                  service_description.length > 20
                    ? `${service_description.slice(0, 20)}...`
                    : service_description
                }${price ? ` - ${priceFormat}` : ""}`}
                className="chip"
              />
            </Tooltip>
          );
        }
      )}
  </div>
);

export const Services = memo(_Services);
