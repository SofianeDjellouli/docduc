import React, { Component } from "react";
import { baseAuthRequest } from "../../utils";
import { currentMonth, currentYear, months, years, formatDate, toCsv } from "./utils";
import "./style.css";

export class Dashboard extends Component {
  state = { sending: false, isMonth: true, month: months[currentMonth], year: years[0] };

  toggleRange = _ => this.setState(({ isMonth }) => ({ isMonth: !isMonth }));

  handleChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  handleGet = () => {
    const { isMonth, month, year } = this.state,
      indexOfMonth = months.indexOf(month),
      from = formatDate(new Date(year, isMonth ? indexOfMonth : 0)),
      to = formatDate(new Date(isMonth ? year : year + 1, isMonth ? indexOfMonth + 1 : 0, 0));
    this.setState({ sending: true }, _ =>
      baseAuthRequest
        .get(`dashboard/appointments?from_date=${from} 00:00&to_date=${to} 23:59`)
        .then(({ data }) => toCsv(data))
        .then(_ => this.setState({ sending: false }))
    );
  };

  render() {
    const { isMonth, month, year, sending } = this.state;
    return (
      <div className="tabContent">
        <h4>Data</h4>
        <div className="center-block">
          <ul className="nav nav-tabs">
            <li className={isMonth ? "active" : undefined} onClick={this.toggleRange}>
              <div>MTD</div>
            </li>
            <li className={!isMonth ? "active" : undefined} onClick={this.toggleRange}>
              <div>YTD</div>
            </li>
          </ul>
        </div>
        <fieldset>
          <label>
            <span>{isMonth ? "Month" : "Year"}</span>
            <div className="dashboard">
              {isMonth && (
                <select onChange={this.handleChange} value={month} name="month">
                  {months.slice(0, year === currentYear ? currentMonth + 1 : 12).map(month => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              )}
              <select onChange={this.handleChange} value={year} name="year">
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </fieldset>
        <button
          style={{ width: "100%" }}
          className="btn softo-solid-btn pull-right"
          onClick={this.handleGet}
          disabled={sending}>
          {sending && <i className="fa fa-spinner fa-spin" />} Export
        </button>
      </div>
    );
  }
}
