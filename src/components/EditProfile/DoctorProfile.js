import React, { PureComponent, Fragment } from "react";
import { Chip, Grid } from "@material-ui/core";
import {
  Crop,
  RenderCheck,
  RenderRadio,
  TooltipInfo,
  ModalInsurances,
  ItemsList,
  RenderAuto,
  RenderInput,
  GridForm,
  RenderArea,
  RenderPhone,
  RenderAutoClear
} from "../";
import {
  getLanguages,
  getSpecialty,
  baseAuthRequest,
  isAll,
  sortByName,
  allOnTop,
  getPlaces,
  handleClassPromise,
  Title,
  geocode,
  notFirstCap,
  hasSpecialChars
} from "../../utils";
import { Primary, handleSuggestions, handleDoctorData, genders } from "./utils";
import "./style.css";

export class DoctorProfile extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: "",
      insurancesToggled: false,
      profile: handleDoctorData(props)
    };
  }

  thenState = state => new Promise(resolve => this.setState(state, resolve));

  handleRemove = (index, type) =>
    this.setState(({ profile }) => {
      let remover = [...profile[type]];
      remover.splice(index, 1);
      return {
        profile: {
          ...profile,
          [type]: remover,
          ...(profile[type][index] === Primary &&
            profile.isPrimaryCarePhysician && { isPrimaryCarePhysician: false })
        }
      };
    });

  setProfile = (changes, additional, callback) =>
    this.setState(
      ({ profile }) => ({ profile: { ...profile, ...changes }, ...additional }),
      callback
    );

  handleProfile = ({ target: { name, value } }) => this.setProfile({ [name]: value });

  onPicture = picture => this.setProfile({ picture });

  handleClearSpecialty = _ => this.setProfile({ mainSpecialtyID: "" });

  clearAddress = _ => this.setProfile({ addressLine1: "" });

  addLanguage = ({ value }) =>
    this.setState(({ profile: { spokenLanguage, ...profile } }) => ({
      profile: { ...profile, spokenLanguage: [...spokenLanguage, value] }
    }));

  handleIsPrimary = ({ target: { checked } }) =>
    this.setState(({ profile }) => {
      const { mainSpecialtyID, subSpecialtyID } = profile,
        i = subSpecialtyID.indexOf(Primary),
        inSub = i > -1;
      return {
        profile: {
          ...profile,
          isPrimaryCarePhysician: checked,
          ...(checked
            ? !mainSpecialtyID
              ? { mainSpecialtyID: Primary }
              : { subSpecialtyID: [...subSpecialtyID, Primary] }
            : mainSpecialtyID === Primary
            ? { mainSpecialtyID: "" }
            : inSub && {
                subSpecialtyID: [...subSpecialtyID.slice(0, i), ...subSpecialtyID.slice(i + 1)]
              })
        }
      };
    });

  setError = error => {
    this.props.setSnackbar({ message: error });
    this.setState({ error });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { profile, error } = this.state,
      {
        firstName,
        lastName,
        spokenLanguage,
        subSpecialtyID,
        insurances,
        // chargeFees,
        abmsCert
      } = profile;
    let names = [firstName, lastName];
    for (let i = 0; i < names.length; i++) {
      let name = names[i].split(/-|'| /).filter(Boolean);
      for (let j = 0; j < name.length; j++)
        if (notFirstCap(name[j]))
          return this.setError("Only the first letter of your name may be capitalized.");
      if (hasSpecialChars(name[i]))
        return this.setError("Your name can't include special characters.");
    }

    handleClassPromise(
      _ =>
        baseAuthRequest
          .post("update_doctor_profile", {
            ...profile,
            /*disable_booking_fee: !chargeFees,
              appointment_out_of_pocket_price: chargeFees ? 2000 : 0,*/
            spokenLanguage: spokenLanguage && spokenLanguage.length ? spokenLanguage.join(",") : "",
            subSpecialtyID: subSpecialtyID && subSpecialtyID.length ? subSpecialtyID.join(",") : "",
            insurances:
              insurances && insurances.length ? insurances.map(({ ID }) => parseInt(ID)) : [],
            abmsCert: abmsCert ? "Yes" : "No"
          })
          .then(({ data }) => {
            this.props.setSnackbar({
              type: 0,
              message: "You have successfully updated your profile."
            });
            this.props.setData(data);
            if (error) this.setState({ error: "" });
            localStorage.setItem("user_picture", profile.picture);
          }),
      loading => this.thenState({ loading })
    );
  };

  handleCheck = ({ target: { name, checked } }) => this.setProfile({ [name]: checked });

  handleAddress = ({ value }) => geocode(value).then(address => this.setProfile({ ...address }));

  handleMainSpecialty = ({ value }) =>
    this.setProfile({ mainSpecialtyID: value, isPrimaryCarePhysician: value === Primary });

  handleSubSpecialty = ({ value }) =>
    this.setState(({ profile }) => {
      const _subSpecialtyID = [...profile.subSpecialtyID, value];
      return {
        profile: {
          ...profile,
          subSpecialtyID: _subSpecialtyID,
          isPrimaryCarePhysician: _subSpecialtyID.includes(Primary)
        }
      };
    });

  insurancesToggle = _ =>
    this.setState(({ insurancesToggled }) => ({ insurancesToggled: !insurancesToggled }));

  addInsurance = a =>
    this.setState(({ profile }) => {
      let _insurances = [...profile.insurances],
        i = _insurances.length;
      if (isAll(a)) while (i--) if (_insurances[i].name === a.name) _insurances.splice(i, 1);
      return { profile: { ...profile, insurances: allOnTop(sortByName([..._insurances, a])) } };
    });

  removeItem = ({
    currentTarget: {
      dataset: { i, name }
    }
  }) => this.handleRemove(i, name);

  handleName = name => ({
    name,
    "aria-label": name,
    id: name,
    value: this.state.profile[name],
    onChange: this.handleProfile
  });

  render() {
    const {
        addInsurance,
        removeItem,
        handleCheck,
        insurancesToggle,
        onPicture,
        state: {
          insurancesToggled,
          loading,
          error,
          profile: {
            addressLine1,
            picture,
            spokenLanguage,
            aboutDescription,
            mainSpecialtyID,
            subSpecialtyID,
            gender,
            insurances
          }
        }
      } = this,
      specialties = [mainSpecialtyID, ...subSpecialtyID];
    return (
      <Grid item sm={6}>
        <GridForm onSubmit={this.handleSubmit} className="edit-profile-form">
          <Grid item xs={12}>
            {Title("Contact info")}
          </Grid>
          <RenderInput required autoFocus label="First name" {...this.handleName("firstName")} />
          <RenderInput required label="Last name" {...this.handleName("lastName")} />
          <RenderRadio label="Gender" control={genders} {...this.handleName("gender")} />
          <RenderPhone required label="Phone" {...this.handleName("phone")} />
          <RenderAuto
            sm={12}
            className="form-input"
            label="Languages"
            placeholder="Search"
            setValueOnClick={false}
            getData={getLanguages}
            handleClick={this.addLanguage}
            strainer={spokenLanguage}
          />
          <Grid item xs={12} className="wrap">
            {spokenLanguage &&
              spokenLanguage.length > 0 &&
              spokenLanguage.map((e, i) => (
                <Chip
                  color="primary"
                  key={e}
                  onDelete={() => this.handleRemove(i, "spokenLanguage")}
                  label={e}
                />
              ))}
          </Grid>
          <Grid item xs={12} element="label" className="form-label">
            Profile Picture
          </Grid>
          <Crop src={picture || `/img/doctor${gender || "Male"}.svg`} {...{ onPicture }} />
          <Grid item xs={12}>
            {Title("Practice info")}
          </Grid>
          <RenderInput required sm={12} label="Practice name" {...this.handleName("practice")} />
          <RenderArea
            maxLength={380}
            sm={12}
            label="About your practice"
            placeholder="Write something about yourself or your practice"
            {...this.handleName("aboutDescription")}
          />
          <Grid item sm={12} className="aboutcharleft">
            {380 - aboutDescription.length} characters left
          </Grid>
          <RenderAutoClear
            required
            sm={12}
            label="Practice address"
            getData={getPlaces}
            title={addressLine1}
            handleClick={this.handleAddress}
            onClear={this.clearAddress}
          />
          <RenderInput label="Apt/Suite" {...this.handleName("addressLine2")} />
          <RenderInput required label="City" {...this.handleName("city")} />
          <RenderInput required label="State" {...this.handleName("state")} />
          <RenderInput label="Zip" {...this.handleName("zip")} />
          <Grid item xs={12}>
            {Title("Physician info")}
          </Grid>
          <RenderCheck
            {...this.handleName("isPrimaryCarePhysician")}
            onChange={this.handleIsPrimary}
            sm={12}
            checkLabel={
              <Fragment>
                Do you provide primary care?
                <TooltipInfo title='A "primary care physician" (PCP) is a physician who provides both the first contact for a person with an undiagnosed health concern as well as continuing care of varied medical conditions, not limited by cause, organ system, or diagnosis.' />
              </Fragment>
            }
          />
          <RenderCheck
            onChange={handleCheck}
            sm={12}
            {...this.handleName("abmsCert")}
            checkLabel={
              <Fragment>
                Are you board certified?
                <TooltipInfo title="Your certifications represent a current demonstration of your knowledge, skills, and experience to provide quality care in a specialty or subspecialty." />
              </Fragment>
            }
          />
          <RenderAutoClear
            required
            sm={12}
            label="Main specialty"
            getData={getSpecialty}
            title={mainSpecialtyID}
            handleClick={this.handleMainSpecialty}
            strainer={specialties}
            onClear={this.handleClearSpecialty}
            {...{ handleSuggestions }}
          />
          <RenderAuto
            sm={12}
            label="Additional specialties"
            className="form-input"
            setValueOnClick={false}
            getData={getSpecialty}
            handleClick={this.handleSubSpecialty}
            strainer={specialties}
            {...{ handleSuggestions }}
          />
          <Grid item xs={12} className="wrap">
            {subSpecialtyID &&
              subSpecialtyID.length > 0 &&
              subSpecialtyID.map((e, i) => (
                <Chip
                  color="primary"
                  key={e}
                  onDelete={() => this.handleRemove(i, "subSpecialtyID")}
                  label={e}
                />
              ))}
          </Grid>
          <RenderInput
            readOnly
            sm={12}
            placeholder="Accepted insurances"
            onClick={insurancesToggle}
          />
          <ItemsList
            title="Accepted insurances"
            sm={12}
            onRemove={removeItem}
            items={insurances}
            name="insurances"
            primary="plan"
            secondary="name"
          />
          <RenderInput required sm={12} label="License" {...this.handleName("license")} />
          {/*<div className="row" style={{ marginTop: 20 }}>
                      <RenderCheck
                        name="chargeFees"
                        value={chargeFees}
                        onChange={handleCheck}
                        col={12}
                        label={
                          <Fragment>
                            Would you like to charge patients a booking fee?
                            <TooltipInfo title="It will help you reduce no-shows." />
                          </Fragment>
                        }
                      />
                    </div>*/}
          <div className="flex-center">
            <button
              style={{ marginTop: 20 }}
              type="submit"
              className="btn softo-solid-btn pull-right"
              disabled={loading}>
              {loading && <i className="fas fa-circle-notch fa-spin right" />}
              Save
            </button>
          </div>
          {error && <div className="error">{error}</div>}
          <ModalInsurances
            open={insurancesToggled}
            onClose={insurancesToggle}
            onRemove={removeItem}
            {...{ addInsurance, insurances }}
          />
        </GridForm>
      </Grid>
    );
  }
}
