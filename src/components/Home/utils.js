import React, { Fragment, useCallback, useRef } from "react";
import { Grid } from "@material-ui/core";
import { useToggle } from "../../utils";
import { PricingDoctor, PricingPatient } from "../Pricing";

//doctor: content[0]
//patient: content[1]
export const content = [
  {
    isPatient: false,
    title: (
      <Fragment>
        Increase
        <br />
        practice revenue
      </Fragment>
    ),
    subtitle: "more appointments, automated patient collections, video visits, text chats...",
    benefits: [
      {
        title: "Increase revenue",
        subtitle:
          "Docduc is a marketplace for patients to find healthcare providers. Increase revenue and profitability by growing your practice and lowering your overall patient acquisition cost."
      },
      {
        title: "No-shows",
        subtitle:
          "Typical no-show rate for a practice is 23%. Which amounts to a whopping $100,000 of revenue loss per physician. Docduc can help decrease your no-show rates to 2%."
      },
      {
        title: "Telehealth",
        subtitle:
          "Provide increased and alternative access to your patients with secure video visits and text chat. Polls show that over 60% of patients today prefer the convenience of virtual care over in office care."
      },
      {
        title: "Payments",
        subtitle:
          "More than half of patients do not pay at the point of service. Furthermore only 30% pay after being invoiced. Docduc can help collect 95% of your payments while going paperless."
      }
    ],
    sitting: {
      title: "How can I grow my practice?",
      content: [
        {
          icon: "fas fa-search-dollar",
          text: "Thousands of patients looking for physicians with your specialty"
        },
        { icon: "fas fa-ad", text: "Advertise to patients most likely to show up" },
        {
          icon: "fas fa-broadcast-tower",
          text: "Much more cost effective compared to radio, periodical and broadcast"
        },
        { icon: "fas fa-filter", text: "Patients come to you prescreened" }
      ]
    },
    talk: {
      title: "Am I up to date with technology?",
      content: [
        { icon: "fas fa-file-invoice", text: "HIPAA Compliant" },
        { icon: "fas fa-piggy-bank", text: "Reimbursable (Congress passed Parity Laws)" },
        { icon: "fas fa-magnet", text: "Attract and retain patients" },
        { icon: "fas fa-dollar-sign", text: "Directly connect to your EHR system" },
        { icon: "fas fa-level-down-alt", text: "Reduce readmissions" },
        { icon: "fas fa-smile", text: "Reduce no-shows to low single digits" }
      ]
    },
    phone: {
      title: "How can I better communicate with patients?",
      content: [
        {
          icon: "fas fa-notes-medical",
          text: "Stop chasing payments and bill patients more effectively"
        },
        { icon: "far fa-comments", text: "Increase patient engagement through push notifications" },
        {
          icon: "fas fa-handshake",
          text:
            "Much more convenient than calling and less of a burden on your administrative staff"
        }
      ]
    },
    pricing: <PricingDoctor />,
    faq: [
      {
        q: "How much this will cost me?",
        a: "Docduc is free for your patients and costs $290/month for the physician."
      },
      {
        q: "Will I be reimbursed for video visits?",
        a:
          "A majority of states have passed Parity Laws which require insurance companies to reimburse."
      },
      {
        q: "Can't I use Facetime or Skype to perfom video visits?",
        a:
          "Consumer apps are not approved by HIPAA and there can be fines and penalties for doing so."
      }
    ]
  },
  {
    isPatient: true,
    title: (
      <Fragment>
        Find doctors
        <br />
        near you
      </Fragment>
    ),
    subtitle: "by distance, insurance, reviews and more...",
    benefits: [
      {
        title: "Search",
        subtitle:
          "Search for a specific physician by name (such as your PCP) or a medical specialization nearby using filters to fit your needs specifically."
      },
      {
        title: "Schedule Visits",
        subtitle:
          "Schedule your visits to the doctor directly from within the app without having to call anyone or go through automated phone systems."
      },
      {
        title: "Video / Text",
        subtitle:
          "Get medical assistance from the comfort of your home. Just like visiting in person, you can get a prescription and is covered by insurance."
      },
      {
        title: "Chatbot",
        subtitle:
          "Not sure which specialist you should consult. Our chatbot will suggest you the right specialist based on your symptoms."
      }
    ],
    sitting: {
      title: "How can I search for doctors in my area?",
      content: [
        { icon: "fa fa-database", text: "No need to search oudated insurance databases anymore" },
        {
          icon: "fas fa-search-location",
          text: "Put your scheduling needs first and find nearby doctors by your availability"
        },
        {
          icon: "fas fa-eye",
          text: "Read reviews and see what other patients are saying before picking your physician"
        },
        {
          icon: "fas fa-chalkboard-teacher",
          text: "Schedule a hassle free video or in person visit"
        }
      ]
    },
    talk: {
      title: "Why video calls?",
      content: [
        { icon: "fa fa-car", text: "No transportation time and cost" },
        { icon: "fa fa-child", text: "No need for childcare or eldercare" },
        { icon: "fas fa-school", text: "No time off work for parents or school for childern" },
        { icon: "fas fa-user-clock", text: "No waiting rooms or catching new illnesses" },
        { icon: "fa fa-user-md", text: "Leverage specialists with your PCP" },
        { icon: "fa fa-heartbeat", text: "Increased access and checkup lead to better health" }
      ]
    },
    phone: {
      title: "Why text messages?",
      content: [
        { icon: "fas fa-phone", text: "No more being put on hold" },
        { icon: "far fa-comments", text: "Reffer back to the conversation" },
        { icon: "fas fa-eye", text: "Discuss private matters publicly" }
      ]
    },
    pricing: <PricingPatient />,
    faq: [
      {
        q: "How much this will cost me?",
        a: "Docduc is free for patient's use. However, there may be costs from your insurer."
      },
      {
        q: "Why do I have to pay when booking an appointment?",
        a: "Your payment reflects your copay which goes to your physician."
      },
      {
        q: "Can the physician prescribe medication over a video visit?",
        a: "Yes. The physician will apply the same discretion as an in-person visit."
      }
    ]
  }
];

export const benefitsIcons = ["fas fa-search", "far fa-clock", "fas fa-video", "fas fa-robot"];

export const platforms = [
  <Grid className="platform" container spacing={3} alignItems="center" justify="center">
    <Grid md item component="h3">
      Simplified solutions
    </Grid>
    <Grid md={6} item component="img" src="/img/laptop.png" alt="Laptop" />
    <Grid md item component="h3">
      for complex times.
    </Grid>
  </Grid>,
  <Grid className="platform" container spacing={3} justify="center">
    <Grid md item className="flex-column">
      <h3>Healthcare anywhere any time</h3>
      <button className="store">
        <img src="/img/google_play_badge.svg" alt="Play store link" width="220" />
      </button>
    </Grid>
    <Grid md item className="flex-center">
      <img src="/img/android-screenshot.png" alt="Android phone" />
    </Grid>
  </Grid>,
  <Grid className="platform" container spacing={3} justify="center">
    <Grid md item className="flex-center">
      <img src="/img/ios-screenshot.png" alt="iPhone" />
    </Grid>
    <Grid md item className="flex-column">
      <h3>Send a message and start communicating.</h3>
      <button className="store">
        <img src="/img/app_store_badge.svg" alt="App store link" width="220" />
      </button>
    </Grid>
  </Grid>
];

export const Video = className => {
  const ref = useRef(),
    { toggle, toggled } = useToggle(true),
    handleClick = useCallback(
      _ => {
        if (ref.current) ref.current[ref.current.paused ? "play" : "pause"]();
        toggle();
      },
      [ref, toggle]
    );

  return (
    <section className={`video${className || ""}`}>
      <h2>How it began</h2>
      <div className="container relative">
        <video
          poster="/img/poster.png"
          onEnded={toggle}
          onClick={handleClick}
          {...{ ref, ...(!toggled && { controls: true }) }}>
          <source src="/img/video.mp4" type="video/mp4" />
        </video>
        {toggled && (
          <div className="play-wrapper" onClick={handleClick}>
            <img src="/img/thumbnail_large.png" alt="play" />
          </div>
        )}
      </div>
    </section>
  );
};
