import React, { useState, useCallback, memo } from "react";
import { Modal, Autocomplete, ModalCreateService, Confirmation, Tooltip } from "../";
import {
  Button,
  ButtonGroup,
  InputAdornment,
  Input,
  Chip,
  FormLabel,
  Collapse
} from "@material-ui/core";
import { useToggle, handleRemove } from "../../utils";
import { getData, defaultForm, defaultService, MuiInput, handleSuggestions } from "./utils";
import "./style.css";

const _ServicesModal = ({ open, onClose, id }) => {
  const [form, setForm] = useState(defaultForm),
    [openCustom, setOpenCustom] = useState(""),
    onCloseCustom = useCallback(_ => setOpenCustom(""), []),
    toggleConfirmation = useToggle(),
    handleCustom = useCallback(({ currentTarget: { name } }) => setOpenCustom(name), []),
    handleChange = useCallback(
      ({ currentTarget: { dataset, name, value } }) =>
        setForm(form => ({
          ...form,
          [name]: dataset.value || value,
          errors: { ...form.errors, [name]: false }
        })),
      []
    ),
    handleCharge = useCallback(
      ({
        currentTarget: {
          dataset: { value }
        }
      }) =>
        setForm(form => ({
          ...form,
          payment_type: value,
          ...(value === "3" && { insurance_type: "", price: "" }),
          errors: { ...form.errors, payment_type: false }
        })),
      []
    ),
    addDiagnosis = useCallback(
      ({ setValue, ...diagnosis }) =>
        setForm(({ diagnoses, errors, ...form }) => ({
          ...form,
          diagnoses: [...diagnoses, diagnosis],
          errors: { ...errors, diagnoses: false }
        })),
      []
    ),
    addService = useCallback(
      ({ value, code, id }) =>
        setForm(form => ({
          ...form,
          service_id: id,
          service_code: code,
          service_description: value,
          errors: { ...form.errors, service: false }
        })),
      []
    ),
    removeDiagnosis = useCallback(
      (i, value) => _ =>
        setForm(({ diagnoses, ...form }) => ({ ...form, diagnoses: handleRemove(diagnoses)(i) })),
      []
    ),
    removeService = useCallback(_ => setForm(form => ({ ...form, ...defaultService })), []),
    addProcedure = useCallback(
      e => {
        e.preventDefault();
        let { service_code, service_id, diagnoses, price, payment_type, insurance_type } = form,
          errors = {};
        if (!(service_code || service_id)) errors.service = "Please enter a service.";
        if (!diagnoses.length) errors.diagnoses = "Please add at least one diagnosis.";
        if (!payment_type) errors.payment_type = "Please select a way to charge.";
        if (payment_type && payment_type !== "3") {
          if (!price) errors.price = "Please enter a price.";
          else if (price < 0.5) errors.price = "Minimum price of $0,50";
          else if (price > 999999) errors.price = "Maximum price of $999,999";
          else if (price.startsWith("0")) errors.price = "The price can't start with a 0";
          if (!insurance_type) errors.insurance_type = "Please select an insurance type.";
        }
        if (Object.keys(errors).length) setForm(form => ({ ...form, errors }));
        else toggleConfirmation.toggle();
      },
      [toggleConfirmation, form]
    ),
    {
      errors,
      diagnoses,
      service_description,
      service_code,
      price,
      insurance_type,
      payment_type
    } = form;
  return (
    <Modal
      title="Add procedure"
      {...{ open, onClose }}
      className="services-modal"
      PaperProps={{ component: "form", onSubmit: addProcedure }}
      actions={
        <Button type="submit" color="primary">
          OK
        </Button>
      }>
      <div className="title-modal">
        ICD <span className="services-modal__required"> *</span>
      </div>
      <Autocomplete
        autoFocus
        setValueOnClick={false}
        render={MuiInput}
        strainer={diagnoses}
        error={!!errors.diagnoses}
        getData={getData("diagnoses")}
        handleClick={addDiagnosis}
        placeholder="ٍSearch ICDs"
        {...{ handleSuggestions }}
      />
      <div className="custom-wrapper">
        <div className="or">
          <hr />
          <span>or</span>
        </div>
        <Button color="primary" name="diagnosis" onClick={handleCustom}>
          Add custom ICD
        </Button>
      </div>
      {errors.diagnoses && (
        <FormLabel className="services-modal__error-div" error>
          {errors.diagnoses}
        </FormLabel>
      )}
      {diagnoses.length > 0 && (
        <div className="wrap">
          {diagnoses.map(({ value, code }, i) => (
            <Tooltip type={0} title={`${code} - ${value}`} key={code + i}>
              <Chip
                color="primary"
                label={`${code} - ${value.length > 20 ? `${value.slice(0, 20)}...` : value}`}
                onDelete={removeDiagnosis(i, value)}
              />
            </Tooltip>
          ))}
        </div>
      )}
      <div className="title-modal">
        CPT<span className="services-modal__required"> *</span>
      </div>
      <Autocomplete
        render={MuiInput}
        error={!!errors.service}
        handleClick={addService}
        getData={service_description ? _ => Promise.resolve(null) : getData("service")}
        placeholder="Search CPTs"
        {...(service_code && { title: `${service_code} - ${service_description}` })}
        disabled={!!service_description}
        multiline
        endAdornment={
          service_description && (
            <InputAdornment
              onClick={removeService}
              position="end"
              className="services-modal__clear-service">
              <i className="fas fa-times-circle" />
            </InputAdornment>
          )
        }
        {...{ handleSuggestions }}
      />
      <div className="custom-wrapper">
        <div className="or">
          <hr />
          <span>or</span>
        </div>
        <Button color="primary" name="service" onClick={handleCustom}>
          Add custom CPT
        </Button>
      </div>
      {errors.service && (
        <FormLabel className="services-modal__error-div" error>
          {errors.service}
        </FormLabel>
      )}
      <div className="title-modal">
        Charge <span className="services-modal__required"> *</span>
      </div>
      <ButtonGroup id="type" variant="contained">
        {["Immediately", "6 months", "12 months", "No charge"].map((e, i) => (
          <Button
            data-value={i}
            color={payment_type === i.toString() ? "primary" : "default"}
            onClick={handleCharge}
            key={e}>
            {e}
          </Button>
        ))}
      </ButtonGroup>
      {errors.payment_type && (
        <FormLabel className="services-modal__error-div" error>
          {errors.payment_type}
        </FormLabel>
      )}
      <Collapse in={payment_type !== "3"}>
        <div>
          <div className="title-modal collapsed">
            Price <span className="services-modal__required"> *</span>
          </div>
          <Input
            fullWidth
            error={!!errors.price}
            id="adornment-amount"
            value={price}
            name="price"
            type="number"
            className="services-modal__service-input"
            onChange={handleChange}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
          {errors.price && (
            <FormLabel className="services-modal__error-div" error>
              {errors.price}
            </FormLabel>
          )}
          <div className="title-modal">
            Insurance type<span className="services-modal__required"> *</span>
          </div>
          <ButtonGroup id="type" variant="contained">
            {["In network", "Assignment", "Cash only"].map((e, i) => (
              <Button
                name="insurance_type"
                data-value={i}
                color={insurance_type === i.toString() ? "primary" : "default"}
                onClick={handleChange}
                key={e}>
                {e}
              </Button>
            ))}
          </ButtonGroup>
          {errors.insurance_type && (
            <FormLabel className="services-modal__error-div" error>
              {errors.insurance_type}
            </FormLabel>
          )}
        </div>
      </Collapse>
      <ModalCreateService
        open={openCustom}
        onClose={onCloseCustom}
        {...{ addDiagnosis, addService }}
      />
      <Confirmation
        open={toggleConfirmation.toggled}
        onClose={toggleConfirmation.toggle}
        closeParent={onClose}
        {...{ setForm, id, ...(toggleConfirmation.toggled && { form }) }}
      />
    </Modal>
  );
};

export const ServicesModal = memo(_ServicesModal);
