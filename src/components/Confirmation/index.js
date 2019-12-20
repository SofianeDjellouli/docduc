import React, { useCallback, memo, Fragment, useMemo, useState, useEffect } from "react";
import { Modal, Services } from "../";
import { defaultForm } from "../ServicesModal/utils";
import { Button } from "@material-ui/core";
import { handlePromise, useToggle } from "../../utils";
import { useDispatch } from "react-redux";
import { addServices } from "../DoctorCalendar/actions";

const _Confirmation = ({ onClose, open, closeParent, form, setForm, id }) => {
  const [services, setServices] = useState([]);
  const dispatch = useDispatch();
  const { toggle, toggled } = useToggle();
  const handleCancel = useCallback(
    _ => {
      setServices(services => services.slice(0, services.length - 1));
      onClose();
    },
    [onClose]
  );
  const onAdd = useCallback(
    _ => {
      setForm(defaultForm);
      onClose();
    },
    [setForm, onClose]
  );
  const confirmServices = useCallback(
    _ =>
      handlePromise(
        dispatch(addServices(services, id)).then(_ => {
          onAdd();
          closeParent();
        }),
        toggle
      ),
    [dispatch, services, toggle, closeParent, id, onAdd]
  );
  const multiple = services.length > 1;
  const hasPrice = useMemo(
    _ => {
      for (let i = 0; i < services.length; i++) if (services[i].price) return true;
      return false;
    },
    [services]
  );
  useEffect(
    _ => {
      if (form)
        setServices(services => {
          let { errors, price, ..._form } = form;
          return [...services, { ..._form, price: price * 100 }];
        });
    },
    [form]
  );
  return (
    <Modal
      {...{ open }}
      onClose={handleCancel}
      title={`You are about to add th${multiple ? "ese" : "is"} procedure${multiple ? "s" : ""}`}
      actions={
        <Fragment>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={onAdd} color="primary">
            Add another procedure
          </Button>
          <Button disabled={toggled} onClick={confirmServices} color="primary">
            {toggled && <i className="fas fa-circle-notch fa-spin right" />}
            {`Confirm${hasPrice ? " and charge the patient" : ""}`}
          </Button>
        </Fragment>
      }>
      <Services {...{ services }} />
    </Modal>
  );
};

export const Confirmation = memo(_Confirmation);
