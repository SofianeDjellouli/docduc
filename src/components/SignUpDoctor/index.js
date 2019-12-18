import React, { useCallback, useState, useEffect, Fragment } from "react";
import { get } from "axios";
import { navigate, A } from "hookrouter";
import { MobileStepper, IconButton, Grid, Chip } from "@material-ui/core";
import {
  TooltipInfo,
  ModalInsurances,
  Crop,
  RenderInput,
  RenderArea,
  RenderPassword,
  RenderAutoClear,
  RenderRadio,
  RenderCheck,
  RenderToolAuto,
  RenderPhone,
  ItemsList
} from "../";
import {
  baseRequest,
  getPlaces,
  geocode,
  getLanguages,
  getSpecialty,
  handleSpecialtiesSuggestions,
  useToggle,
  sortByPlan,
  handlePromise,
  isAll,
  loadMap,
  Title,
  hasSpecialChars,
  notFirstCap
} from "../../utils";
import {
  FormTitle,
  genders,
  Primary,
  pickAddress,
  defaultForm,
  errors,
  formSteps,
  defaultAddressForm
} from "./utils";
import "./style.css";

// const NPICheckPath = "https://npiregistry.cms.hhs.gov/api/?version=2.1&number=1427051424";

const SignUpDoctor = _ => {
  const [step, setStep] = useState(0),
    handleNext = useCallback(_ => setStep(step => step + 1), [setStep]),
    handleBack = useCallback(_ => setStep(step => step - 1), [setStep]),
    [form, setForm] = useState(defaultForm),
    [errorForm, setErrorForm] = useState({ ...errors, error: "" }),
    removeItem = useCallback(
      (i, name) => _ =>
        setForm(form => {
          let list = [...form[name]];
          list.splice(i, 1);
          return {
            ...form,
            [name]: list,
            ...(form[name][i] === Primary &&
              form.isPrimaryCarePhysician && { isPrimaryCarePhysician: false })
          };
        }),
      []
    ),
    onChange = useCallback(
      ({ target: { name, value } }) => {
        setForm(form => ({ ...form, [name]: value }));
        if (errorForm[name]) setErrorForm(errors => ({ ...errors, [name]: "" }));
      },
      [errorForm]
    ),
    handlePicture = useCallback(value => onChange({ target: { name: "picture", value } }), [
      onChange
    ]),
    clearMainSpecialty = useCallback(
      _ =>
        setForm(({ isPrimaryCarePhysician, mainSpecialtyID, ...form }) => ({
          ...form,
          mainSpecialtyID: "",
          ...(isPrimaryCarePhysician &&
            mainSpecialtyID === Primary && { isPrimaryCarePhysician: false })
        })),
      []
    ),
    clearAddress = useCallback(_ => onChange({ target: { name: "addressLine1", value: "" } }), [
      onChange
    ]),
    /* handlePhone = useCallback(
      ({ target: { value } }) => {
        if (!value || /^[0-9 ]+$/.test(value)) {
          const phone = value.replace(/ /g, "");
          setForm(form => ({
            ...form,
            phone:
              phone.length > 3
                ? `${phone.slice(0, 3)} ${phone.slice(3, 6)}${
                    phone.length > 6 ? " " : ""
                  }${phone.slice(6)}`
                : phone
          }));
          if (errorForm.phone) setErrorForm(errors => ({ ...errors, phone: "" }));
        }
      },
      [errorForm]
    ),*/
    addInsurance = useCallback(
      a =>
        setForm(({ insurances, ...form }) => {
          let _insurances = [...insurances],
            i = _insurances.length;
          if (isAll(a)) while (i--) if (_insurances[i].name === a.name) _insurances.splice(i, 1);
          return { ...form, insurances: sortByPlan([..._insurances, a]) };
        }),
      []
    ),
    removeInsurance = useCallback(
      ({
        currentTarget: {
          dataset: { i }
        }
      }) => removeItem(i, "insurances")(),
      [removeItem]
    ),
    handleName = useCallback(
      name => ({ onChange, name, value: form[name], error: errorForm[name] }),
      [form, errorForm, onChange]
    ),
    insurancesToggle = useToggle(),
    submitToggle = useToggle(),
    handleAddressChange = useCallback(
      value => {
        if (form.latitude) setForm(form => ({ ...form, ...defaultAddressForm }));
        return getPlaces(value);
      },
      [form.latitude]
    ),
    handleAddress = useCallback(
      ({ value }) =>
        geocode(value).then(({ lat, lng, ...results }) => {
          setForm(form => ({
            ...form,
            ...results,
            latitude: lat.toString(),
            longitude: lng.toString()
          }));
          setErrorForm(errors => ({ ...errors, ...defaultAddressForm }));
        }),
      []
    ),
    addLanguage = useCallback(
      ({ value }) =>
        setForm(form => ({ ...form, spokenLanguage: [...form.spokenLanguage, value] })),
      []
    ),
    handleIsPrimary = useCallback(
      ({ target: { checked } }) => {
        const { mainSpecialtyID } = form;
        setForm(form => {
          const { subSpecialtyID } = form,
            i = subSpecialtyID.indexOf(Primary),
            inSub = i > -1;
          return {
            ...form,
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
          };
        });
        if (errorForm.mainSpecialtyID && (checked || mainSpecialtyID))
          setErrorForm(errors => ({ ...errors, mainSpecialtyID: "" }));
      },
      [form, errorForm]
    ),
    handleMainSpecialty = useCallback(
      ({ value }) =>
        setForm(form => ({
          ...form,
          mainSpecialtyID: value,
          isPrimaryCarePhysician: value === Primary
        })),
      []
    ),
    handleSubSpecialty = useCallback(
      ({ value }) =>
        setForm(form => {
          const subSpecialtyID = [...form.subSpecialtyID, value];
          return {
            ...form,
            subSpecialtyID,
            isPrimaryCarePhysician: subSpecialtyID.includes(Primary)
          };
        }),
      []
    ),
    filter = useCallback(
      array => ({ value }) => {
        for (let i = 0; i < array.length; i++) if (array[i] === value) return false;
        return true;
      },
      []
    ),
    filterSpecialty = useCallback(filter([form.mainSpecialtyID, ...form.subSpecialtyID]), [
      form.mainSpecialtyID,
      form.subSpecialtyID
    ]),
    filterLanguages = useCallback(filter(form.spokenLanguage), [form.spokenLanguage]),
    handleCheck = useCallback(
      ({ target: { checked, name } }) => setForm(form => ({ ...form, [name]: checked })),
      []
    ),
    handleSubmit = useCallback(
      e => {
        e.preventDefault();
        let errors = {};
        [("phone", "license")].forEach(e => {
          if (form[e].length < 10) errors[e] = "Minimum length of 10 characters.";
        });
        ["firstName", "lastName"].forEach(e => {
          let names = form[e].split(/-|'| /).filter(Boolean);
          names.forEach(el => {
            if (notFirstCap(el))
              errors[e] = "Only the first letter of your name may be capitalized.";
          });
          if (hasSpecialChars(form[e])) errors[e] = "Your name can't include special characters";
        });
        if (!form.addressLine1) errors.addressLine1 = pickAddress;
        const {
          email,
          confirmEmail,
          password,
          confirmPassword,
          insurances,
          subSpecialtyID,
          spokenLanguage,
          abmsCert,
          // chargeFees,
          ..._form
        } = form;
        if (email !== confirmEmail) errors.confirmEmail = "Emails must match.";
        if (password.length < 8) errors.password = "Minimum length of 8 characters.";
        else if (password !== confirmPassword) errors.confirmPassword = "Passwords must match.";

        for (let i = 0; i < formSteps.length; i++) {
          const formStepsKeys = Object.keys(formSteps[i]);
          for (let j = 0; j < formStepsKeys.length; j++) {
            const key = formStepsKeys[j];
            if (formSteps[i][key].required && !form[key]) errors[key] = "This field is required";
          }
        }
        for (let i = 0; i < formSteps.length; i++) {
          const formStepsKeys = Object.keys(formSteps[i]);
          for (let j = 0; j < formStepsKeys.length; j++)
            if (errors[formStepsKeys[j]] && typeof errors[formStepsKeys[j]] === "string") {
              setErrorForm(_errors => ({ ..._errors, ...errors }));
              return setStep(i);
            }
        }
        handlePromise(
          get("https://api.ipify.org")
            .then(({ data }) =>
              baseRequest.post("signup_doctor", {
                ..._form,
                email,
                password,
                insurances: insurances.map(e => parseInt(e.ID)),
                subSpecialtyID: subSpecialtyID.join(","),
                spokenLanguage: spokenLanguage.join(","),
                abmsCert: abmsCert ? "Yes" : "No",
                user_agent: navigator.userAgent,
                ip_address: data,
                disable_booking_fee: true,
                appointment_out_of_pocket_price: 0
                /*disable_booking_fee: !chargeFees,
                ...(!chargeFees && { appointment_out_of_pocket_price: 0 })*/
              })
            )
            .then(_ => navigate("/sign-up-complete"))
            .catch(error => setErrorForm(errors => ({ ...errors, error }))),
          submitToggle.toggle
        );
      },
      [form, submitToggle.toggle]
    );

  useEffect(_ => {
    loadMap();
  }, []);
  const {
      spokenLanguage,
      mainSpecialtyID,
      subSpecialtyID,
      picture,
      insurances,
      addressLine1
    } = form,
    { error } = errorForm;
  return (
    <main className="sign-up-doctor">
      <img className="background" src="/img/pencils.jpeg" alt="background" />
      <div className="container">
        <div className="main-title">Docduc Health - Doctor Sign Up</div>
        <div className="main-subtitle">
          Already have an account? <A href="/sign-in">Sign in</A>
        </div>
        <Grid container spacing={2} wrap="wrap-reverse">
          <Grid item sm={6} xs={12} component="form" onSubmit={handleSubmit} className="form">
            {(_ => {
              switch (step) {
                case 0:
                  return (
                    <Fragment>
                      {FormTitle("Contact info")}
                      <Grid container spacing={2} alignItems="center">
                        <RenderInput
                          required
                          autoFocus
                          placeholder="First name"
                          {...handleName("firstName")}
                        />
                        <RenderInput required placeholder="Last name" {...handleName("lastName")} />
                        <RenderRadio required control={genders} {...handleName("gender")} />
                        <RenderPhone
                          {...handleName("phone")}
                          placeholder="Phone"
                          required
                          maxLength="15"
                        />
                        <RenderAutoClear
                          placeholder="Spoken languages"
                          getData={getLanguages}
                          handleClick={addLanguage}
                          sm={12}
                          filter={filterLanguages}
                          className="form-input"
                          setValueOnClick={false}
                        />
                        {spokenLanguage.length > 0 && (
                          <Grid item xs={12}>
                            {spokenLanguage.map((e, i) => (
                              <Chip
                                color="primary"
                                key={e}
                                label={e}
                                onDelete={removeItem(i, "spokenLanguage")}
                              />
                            ))}
                          </Grid>
                        )}
                        <Crop
                          src={picture || `/img/doctor${form.gender || "Male"}.svg`}
                          onPicture={handlePicture}
                        />
                      </Grid>
                    </Fragment>
                  );
                case 1:
                  return (
                    <Fragment>
                      {FormTitle("Practice info")}
                      <Grid container spacing={2}>
                        <RenderInput
                          required
                          autoFocus
                          placeholder="Practice name"
                          sm={12}
                          {...handleName("practice")}
                        />
                        <RenderArea
                          placeholder="About your practice"
                          sm={12}
                          {...handleName("aboutDescription")}
                        />
                        <RenderToolAuto
                          required
                          placeholder="Practice address"
                          sm={12}
                          getData={handleAddressChange}
                          handleClick={handleAddress}
                          // setParam={handleAddress}
                          error={errorForm.addressLine1}
                          title={addressLine1}
                          onClear={clearAddress}
                          toolTitle={pickAddress}
                          className="form-input"
                        />
                        <RenderInput placeholder="Apt/Suite" {...handleName("addressLine2")} />
                        <RenderInput required placeholder="City" {...handleName("city")} />
                        <RenderInput required placeholder="State" {...handleName("state")} />
                        <RenderInput placeholder="Zip" {...handleName("zip")} />
                      </Grid>
                    </Fragment>
                  );
                case 2:
                  return (
                    <Fragment>
                      {FormTitle("Physician info")}
                      <Grid container spacing={2}>
                        <RenderCheck
                          {...handleName("isPrimaryCarePhysician")}
                          onChange={handleIsPrimary}
                          sm={12}
                          checkLabel={
                            <Fragment>
                              Do you provide primary care?
                              <TooltipInfo title='A "primary care physician" (PCP) is a physician who provides both the first contact for a person with an undiagnosed health concern as well as continuing care of varied medical conditions, not limited by cause, organ system, or diagnosis.' />
                            </Fragment>
                          }
                        />
                        <RenderCheck
                          {...handleName("abmsCert")}
                          onChange={handleCheck}
                          sm={12}
                          checkLabel={
                            <Fragment>
                              Are you board certified?
                              <TooltipInfo title="Your certifications represent a current demonstration of your knowledge, skills, and experience to provide quality care in a specialty or subspecialty." />
                            </Fragment>
                          }
                        />
                        <RenderAutoClear
                          required
                          placeholder="Main specialty"
                          getData={getSpecialty}
                          title={mainSpecialtyID}
                          onClear={clearMainSpecialty}
                          handleClick={handleMainSpecialty}
                          filter={filterSpecialty}
                          sm={12}
                          error={errorForm.mainSpecialtyID}
                          handleSuggestions={handleSpecialtiesSuggestions}
                        />
                        <RenderAutoClear
                          placeholder="Additional specialties"
                          setValueOnClick={false}
                          getData={getSpecialty}
                          handleClick={handleSubSpecialty}
                          sm={12}
                          filter={filterSpecialty}
                          handleSuggestions={handleSpecialtiesSuggestions}
                        />
                        {subSpecialtyID.length > 0 && (
                          <Grid item xs={12}>
                            {subSpecialtyID.map((e, i) => (
                              <Chip
                                color="primary"
                                key={e}
                                label={e}
                                onDelete={removeItem(i, "subSpecialtyID")}
                              />
                            ))}
                          </Grid>
                        )}
                        <Grid item xs={12} sm={12}>
                          <input
                            readOnly
                            placeholder="Accepted insurances"
                            className="form-input"
                            onClick={insurancesToggle.toggle}
                          />
                        </Grid>
                        <ItemsList
                          title="Accepted insurances"
                          onRemove={removeInsurance}
                          items={insurances}
                          name="insurances"
                          primary="plan"
                          secondary="name"
                          className="form-input"
                        />
                        <RenderInput
                          required
                          sm={12}
                          placeholder="NPI license number"
                          {...handleName("license")}
                        />
                        {/*<RenderCheck
                                                  {...handleName("chargeFees")}
                                                  onChange={handleCheck}
                                                  sm={12}
                                                  label={
                                                    <Fragment>
                                                      Would you like to charge patients a booking fee?
                                                      <TooltipInfo title="It will help you reduce no-shows." />
                                                    </Fragment>
                                                  }
                                                />*/}
                      </Grid>
                    </Fragment>
                  );
                case 3:
                  return (
                    <Fragment>
                      {FormTitle("Credentials")}
                      <Grid container spacing={2}>
                        <RenderInput
                          required
                          autoFocus
                          placeholder="Email"
                          type="email"
                          {...handleName("email")}
                        />
                        <RenderInput
                          required
                          placeholder="Confirm email"
                          type="email"
                          {...handleName("confirmEmail")}
                        />
                        <RenderPassword placeholder="Password" {...handleName("password")} />
                        <RenderPassword
                          placeholder="Confirm password"
                          {...handleName("confirmPassword")}
                        />
                      </Grid>
                      <div className="terms">
                        {"By registering your account, you agree to our "}
                        <a href="/legal/terms-of-service" rel="noopener noreferrer" target="_blank">
                          Terms of Service
                        </a>
                        {" and the "}
                        <a
                          href="https://stripe.com/us/connect-account/legal"
                          rel="noopener noreferrer"
                          target="_blank">
                          Stripe Connected Account Agreement
                        </a>
                        .
                      </div>
                      <div className="flex-center">
                        <button
                          disabled={submitToggle.toggled}
                          type="submit"
                          className="softo-solid-btn">
                          {submitToggle.toggled && (
                            <i className="fas fa-circle-notch fa-spin right" />
                          )}
                          Sign up
                        </button>
                      </div>
                      {error && <div className="error">{error}</div>}
                    </Fragment>
                  );
                default:
                  break;
              }
            })()}
          </Grid>
          <Grid item sm={6} xs={12} className="features">
            {Title("Features")}
            {[
              "Increase patient appointments",
              "Engage your current patient panel",
              "Automatically collect copays and patient balance with out the chase",
              "One-click appointments scheduled",
              "Integrate with your current EHR software",
              "Video visits",
              "Text messaging",
              "Lower patient acquisition costs",
              "Stay in HIPAA compliance",
              "Streamlined Web & Mobile apps for physician, staff and patient",
              "Unlimited storage of your data forever"
            ].map(e => (
              <div key={e} className="feature">
                <i className="fas fa-check-circle right" />
                <span>{e}</span>
              </div>
            ))}
          </Grid>
        </Grid>
        <MobileStepper
          activeStep={step}
          steps={4}
          variant="text"
          className="form-input"
          nextButton={
            <IconButton
              disabled={step === 3}
              onClick={handleNext}
              children={<i className="material-icons">navigate_next</i>}
            />
          }
          backButton={
            <IconButton
              disabled={step === 0}
              onClick={handleBack}
              children={<i className="material-icons">navigate_before</i>}
            />
          }
        />
      </div>
      <ModalInsurances
        open={insurancesToggle.toggled}
        onClose={insurancesToggle.toggle}
        onRemove={removeInsurance}
        {...{ addInsurance, insurances }}
      />
    </main>
  );
};

export default SignUpDoctor;
