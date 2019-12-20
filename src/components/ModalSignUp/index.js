import React, { memo } from "react";
import { Button } from "@material-ui/core";
import { A } from "hookrouter";
import { Modal } from "../";
import "./style.css";

const _ModalSignUp = ({ open, onClose }) => (
  <Modal {...{ open, onClose }} title="Sign up" className="sign-up-modal">
    {[
      { href: "/patients#sign_up", title: "As a patient" },
      { href: "/sign-up-doctor", title: "As a doctor" },
      { href: "/sign-up-practice", title: "As a practice" }
    ].map(({ href, title }) => (
      <Button onClick={onClose} color="primary" key={href}>
        <A {...{ href }}>{title}</A>
      </Button>
    ))}
  </Modal>
);

export const ModalSignUp = memo(_ModalSignUp);
