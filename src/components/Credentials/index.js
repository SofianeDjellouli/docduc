import React, { PureComponent, Fragment } from "react";
import branch from "branch-sdk";
import { Grid } from "@material-ui/core";
import { API, initBranch, isDoctor, baseAuthRequest, GlobalContext } from "../../utils";
import { TooltipInfo, Tooltip, RenderPassword, RenderInput, GridForm } from "../";
import "./style.css";

class MyCredentials extends PureComponent {
  state = {
    user_profileid: this.props.ID,
    email: this.props.email || "",
    emailPassword: "",
    currentPassword: "",
    newPassword: "",
    sending: false
  };

  handleChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  changeEmail = e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    const { user_profileid, email, emailPassword } = this.state;
    this.setState({ sending: true }, _ =>
      baseAuthRequest
        .post("change_email", {
          user_id: user_profileid,
          New_Email: email,
          Password: emailPassword
        })
        .then(() => {
          this.setState({ emailPassword: "", sending: false });
          this.props.setSnackbar({ message: "You have successfully updated your email." });
        })
    );
  };

  changePassword = e => {
    const { user_profileid, currentPassword, newPassword } = this.state;
    baseAuthRequest
      .post("reset_password", {
        user_id: user_profileid.toString(),
        password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword
      })
      .then(() =>
        this.setState({
          currentPassword: "",
          newPassword: ""
        })
      );
  };

  handleCopy = _ => {
    let copyText = document.getElementById("link");
    if (copyText) {
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      document.execCommand("copy");
    }
  };

  handleName = name => ({
    name,
    value: this.state[name],
    "aria-label": name,
    onChange: this.handleChange
  });

  componentDidMount() {
    const { firstName, lastName, ID } = this.props;
    if (isDoctor && ID) {
      initBranch();
      branch.link(
        {
          alias: `invite/${lastName}${ID}`,
          data: {
            deeplink: "docduc://mycare",
            doctor_id: ID.toString(),
            $og_image_url: "https://docduc-prod.s3.amazonaws.com/documents/icon_logo.png",
            $og_description: "Once you finish sign up, I will be added to your care team.",
            $og_title: `Dr. ${firstName} ${lastName} has invited you to join Docduc Health`
          }
        }
        /*handleBranchError*/
      );
    }
  }

  render() {
    const { sending } = this.state,
      { lastName, ID } = this.props,
      link = lastName && ID,
      input = (
        <input
          className="form-input"
          id="link"
          value={
            link
              ? `https://docduchealth.${
                  API.includes("test") ? "test-" : ""
                }app.link/invite/${lastName}${ID}`
              : ""
          }
          onClick={this.handleCopy}
          readOnly
        />
      );
    return (
      <Grid item sm={6}>
        <GridForm onSubmit={this.changeEmail}>
          <Grid item component="h4" xs={12}>
            Update email
          </Grid>
          <RenderInput
            required
            type="email"
            placeholder="Your email"
            {...this.handleName("email")}
          />
          <RenderPassword
            required
            placeholder="Current password"
            {...this.handleName("emailPassword")}
          />
          <Grid className="flex-end" item xs={12}>
            <button type="submit" className="softo-solid-btn" disabled={sending}>
              {sending && <i className="fas fa-circle-notch fa-spin right" />}
              Save
            </button>
          </Grid>
        </GridForm>
        <GridForm onSubmit={this.changePassword}>
          <Grid item component="h4" xs={12}>
            Update password
          </Grid>
          <RenderPassword
            required
            minLength={8}
            placeholder="Current password"
            {...this.handleName("currentPassword")}
          />
          <RenderPassword
            required
            minLength={8}
            placeholder="New password"
            {...this.handleName("newPassword")}
          />
          <Grid className="flex-end" item xs={12}>
            <button type="submit" className="softo-solid-btn" disabled={sending}>
              {sending && <i className="fas fa-circle-notch fa-spin right" />}
              Save
            </button>
          </Grid>
          {isDoctor && (
            <Fragment>
              <Grid item component="h4" xs={12}>
                Referral link
                <TooltipInfo title="Use this link to invite patients and let them add you to their Care Team." />
              </Grid>
              <Grid item xs={12}>
                {link ? (
                  <Tooltip title="Click to copy to your clipboard" children={input} />
                ) : (
                  input
                )}
              </Grid>
              <Grid className="flex-end" item xs={12}>
                <button onClick={this.handleCopy} className="softo-solid-btn">
                  Copy
                </button>
              </Grid>
            </Fragment>
          )}
        </GridForm>
      </Grid>
    );
  }
}

export const Credentials = props => (
  <GlobalContext.Consumer>
    {({ setSnackbar }) => <MyCredentials {...{ setSnackbar, ...props }} />}
  </GlobalContext.Consumer>
);
