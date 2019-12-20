import React, { useState, useCallback, memo } from "react";
import { Modal } from "../";
import { Button, Input, FormLabel } from "@material-ui/core";
import { initialFormData } from "./utils";

const _ModalCreateService = ({ addDiagnosis, addService, open, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const handleChange = useCallback(
    ({ target: { name, value } }) =>
      setFormData(form => ({ ...form, [name]: value, errors: { ...form.errors, [name]: false } })),
    []
  );
  const validateForm = useCallback(() => {
    const { code, value, errors } = formData;
    let valid = true,
      _errors = { ...errors };
    if (!code) {
      _errors.code = "Please enter a code.";
      valid = false;
    }
    if (!value.length) {
      _errors.value = "Please enter a name.";
      valid = false;
    }
    if (!valid) setFormData(form => ({ ...form, errors: _errors }));
    return valid;
  }, [formData]);
  const handleClose = useCallback(
    _ => {
      setFormData(initialFormData);
      onClose();
    },
    [onClose]
  );
  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      const { code, value } = formData;
      (open === "service" ? addService : addDiagnosis)({ value, code, id: null });
      handleClose();
    }
  }, [open, validateForm, formData, addService, addDiagnosis, handleClose]);
  const { errors, code, value } = formData;
  return (
    <Modal
      title={`Create new ${open}`}
      open={Boolean(open)}
      onClose={handleClose}
      actions={
        <Button onClick={handleSubmit} color="primary">
          Create
        </Button>
      }>
      <div className="title-modal">
        Code <span className="services-modal__required"> *</span>
      </div>
      <Input
        autoFocus
        fullWidth
        error={!!errors.code}
        value={code}
        name="code"
        onChange={handleChange}
      />
      {errors.code && (
        <FormLabel className="services-modal__error-label" error>
          {errors.code}
        </FormLabel>
      )}

      <div className="title-modal">
        Name <span className="services-modal__required"> *</span>
      </div>
      <Input
        fullWidth
        error={!!errors.value}
        value={value}
        name="value"
        multiline
        onChange={handleChange}
      />
      {errors.value && (
        <FormLabel className="services-modal__error-label" error>
          {errors.value}
        </FormLabel>
      )}
    </Modal>
  );
};

export const ModalCreateService = memo(_ModalCreateService);
