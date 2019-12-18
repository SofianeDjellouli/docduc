import React, { useState, useEffect, useCallback, Fragment, useContext } from "react";
import { Grid, Collapse, Fade, useMediaQuery } from "@material-ui/core";
import { navigate } from "hookrouter";
import branch from "branch-sdk";
import { content, benefitsIcons, platforms, Video } from "./utils";
import { useToggle, GlobalContext, handleMenuList, isDoctor, getId, initBranch } from "../../utils";
import { ContactUs, SignUpPatient, SignUpRequest, SearchForm, Footer } from "../";
import "./style.css";

const Home = ({ user = isDoctor() ? 0 : 1 }) => {
  const { setHeaderProps, resetHeader, setSnackbar } = useContext(GlobalContext),
    [collapsed, setCollapsed] = useState(null),
    [platform, setPlatform] = useState(0),
    toggleTop = useToggle(true),
    handleCollapse = useCallback(
      ({
        currentTarget: {
          dataset: { i }
        }
      }) =>
        setCollapsed(collapsed => {
          const index = parseInt(i);
          return collapsed === index ? null : index;
        }),
      []
    ),
    handlePlatform = useCallback(
      ({
        currentTarget: {
          dataset: { i }
        }
      }) => setPlatform(parseInt(i)),
      []
    ),
    handleScroll = useCallback(
      ({
        target: {
          documentElement: { scrollTop }
        }
      }) => {
        if (Boolean(scrollTop > 50) === toggleTop.toggled) toggleTop.toggle();
      },
      [toggleTop]
    ),
    sm = useMediaQuery("(max-width:768px)"),
    offline = !getId(),
    { title, subtitle, benefits, sitting, phone, faq, talk, pricing, isPatient } = content[user];

  useEffect(
    _ => {
      if (window.location.search) {
        initBranch();
        branch.data(
          console.log /*
(error, data) => {
          if (!error && data.data_parsed && data.data_parsed.doctor_id) {
            const { $og_title, doctor_id } = data.data_parsed,
              nameToAdd = $og_title.split(" has")[0];
            localStorage.setItem("idToAdd", doctor_id);
            localStorage.setItem("nameToAdd", nameToAdd);
            if (!offline) navigate(`/search?q=${nameToAdd.slice(4)}&type=name`);
          } else if (error)
            setSnackbar({
              message:
                "We haven't been able to retrieve the data from the link. Please try again or contact us at support@docduc.com"
            });
        }
          */
        );
        if (offline) navigate("/patients#sign-up");
      }
    },
    [offline, setSnackbar]
  );

  useEffect(
    _ => {
      document.addEventListener("scroll", handleScroll);
      return _ => document.removeEventListener("scroll", handleScroll);
    },
    [handleScroll]
  );

  useEffect(
    _ => {
      setHeaderProps(({ solidButtons, iconButtons, menuList, ...props }) => {
        const otherUser = isPatient ? "doctor" : "patient",
          toggleDoctorButton = {
            title: `Are you a ${otherUser}?`,
            onClick: _ => navigate(`/${otherUser}s`)
          };
        return {
          solidButtons: [toggleDoctorButton, ...solidButtons],
          iconButtons: [
            ...iconButtons,
            {
              title: "Contact us",
              i: <i className="fas fa-envelope" />,
              onClick: _ =>
                window.scrollTo({
                  top: document.querySelector(".contact-us").offsetTop,
                  behavior: "smooth"
                })
            }
          ],
          menuList: [
            ...(offline
              ? [
                  handleMenuList({
                    ...toggleDoctorButton,
                    i: <i className={`fas fa-user${isPatient ? "" : "-md"}`} />
                  })
                ]
              : []),
            ...menuList
          ],
          ...(toggleTop.toggled && { className: "on-top" }),
          ...props
        };
      });
      return resetHeader;
    },
    [setHeaderProps, resetHeader, isPatient, toggleTop.toggled, offline]
  );

  return (
    <main className="home">
      <section className="top blue">
        <picture>
          <source media="(max-width: 429px)" srcSet="/img/waitingroom2.jpg" />
          <img src="/img/waitingroom.jpg" id="waiting-room" alt="waiting room" />
        </picture>
        <span className="circle-150" />
        <span className="circle-50" />
        <span className="circle-50" />
        <span className="circle-75" />
        <span className="circle-100" />
        <span className="circle-75" />
        <span className="circle-50" />
        <span className="circle-100" />
        <span className="circle-50" />
        <span className="circle-100" />
        <div className="container">
          <Grid container spacing={3} alignItems="center">
            <Grid item md={7}>
              <h1>{title}</h1>
              <h5>{subtitle}</h5>
              <div className="flex">
                <button className="store">
                  <img src="/img/google_play_badge.svg" alt="Play store link" />
                </button>
                <button className="store">
                  <img src="/img/app_store_badge.svg" alt="App store link" />
                </button>
              </div>
            </Grid>
            {(isPatient || offline) && (
              <Grid item md>
                <div className="home-card">
                  {isPatient ? (
                    <SearchForm />
                  ) : sm ? (
                    <Fragment>
                      <h3>Join Docduc now</h3>
                      <SignUpPatient />
                    </Fragment>
                  ) : (
                    offline && <SignUpRequest />
                  )}
                </div>
              </Grid>
            )}
          </Grid>
        </div>
        <picture>
          <source type="image/webp" srcSet="/img/asset_1.webp" />
          <img src="/img/asset_1.png" alt="wave" />
        </picture>
      </section>
      {isPatient && Video()}
      <section className={`benefits${isPatient ? " gray" : ""}`}>
        <h2>What can Docduc do for me?</h2>
        <div className="container">
          <Grid container spacing={4}>
            {benefits.map(({ title, subtitle }, i) => (
              <Grid item key={title} sm={6} md={3}>
                <div className="benefit">
                  <i className={`${benefitsIcons[i]} primary`} />
                  <h3>{title}</h3>
                  {subtitle}
                  <div className="line" />
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      </section>
      <section {...(!isPatient && { className: "gray" })}>
        <h2>Available on</h2>
        <div className="container">
          <div className="flex-center platforms">
            {[
              { iClass: "fas fa-desktop", e: "WEB" },
              { iClass: "fab fa-android", e: "ANDROID" },
              { iClass: "fab fa-apple", e: "IOS" }
            ].map(({ e, iClass }, i) => (
              <button
                key={e}
                data-i={i}
                onClick={handlePlatform}
                {...(i === platform && { className: "active" })}>
                <i className={`right ${iClass}`} />
                {e}
              </button>
            ))}
          </div>
          <Fade in key={platform} className="platform">
            {platforms[platform]}
          </Fade>
        </div>
      </section>
      {isPatient && (
        <section className="gray" id="sign-up">
          <h2>Join Docduc now</h2>
          <div className="container">
            <Grid container spacing={3} justify="center">
              <Grid item sm={6}>
                <SignUpPatient />
              </Grid>
            </Grid>
          </div>
        </section>
      )}
      <section className="blue">
        <h2>{sitting.title}</h2>
        <div className="container">
          <Grid container spacing={3}>
            <Grid item md>
              <img src="/img/search_graphic.svg" alt="Person working" />
            </Grid>
            <Grid item md>
              {sitting.content.map(({ icon, text }) => (
                <h5 key={icon}>
                  <i className={icon} />
                  {text}
                </h5>
              ))}
            </Grid>
          </Grid>
        </div>
      </section>
      <section>
        <h2>{talk.title}</h2>
        <div className="container">
          <Grid container spacing={3}>
            <Grid item md className="flex-column">
              {talk.content.slice(0, 3).map(({ icon, text }) => (
                <h5 key={icon}>
                  <i className={icon} /> {text}
                </h5>
              ))}
            </Grid>
            <Grid item md>
              <img src="/img/video_call_graphic.svg" alt="Video call" />
            </Grid>
            <Grid item md className="flex-column">
              {talk.content.slice(3).map(({ icon, text }) => (
                <h5 key={icon}>
                  <i className={icon} /> {text}
                </h5>
              ))}
            </Grid>
          </Grid>
        </div>
      </section>
      <section className="gray">
        <h2>{phone.title}</h2>
        <div className="container">
          <Grid container spacing={3}>
            <Grid item md className="flex-column">
              {phone.content.map(({ icon, text }) => (
                <h5 key={icon}>
                  <i className={icon} />
                  {text}
                </h5>
              ))}
            </Grid>
            <Grid item md>
              <img src="/img/text_graphic.svg" alt="Phone" />
            </Grid>
          </Grid>
        </div>
      </section>
      <section className="blue">
        <h2>Pricing plan</h2>
        <div className="container">
          <Grid container justify="center">
            {pricing}
          </Grid>
        </div>
      </section>
      {!isPatient && Video(" gray")}
      <section>
        <h2>FAQs</h2>
        <div className="container">
          <Grid container spacing={3}>
            <Grid item md>
              {faq.map(({ q, a }, i) => (
                <Grid item key={q}>
                  <div className="faq">
                    <div className="faq-q" data-i={i} onClick={handleCollapse}>
                      {q}
                      <i className={`fas fa-${collapsed === i ? "min" : "pl"}us`} />
                    </div>
                    <Collapse className="faq-a" in={collapsed === i}>
                      {a}
                    </Collapse>
                    <div className="faq-border" />
                  </div>
                </Grid>
              ))}
            </Grid>
            <Grid item md>
              <img src="/img/faq.svg" alt="Search" />
            </Grid>
          </Grid>
        </div>
      </section>
      <section className="gray">
        <div className="container">
          <Grid container spacing={3}>
            <Grid item sm={5} className="contact-us">
              <h2>Contact us</h2>
              <h3>Head office</h3>
              <div>
                <i className="right primary fas fa-map-marker" />
                <span>1875 Connecticut Ave. NW, Washington, DC 20009</span>
              </div>
              <div>
                <i className="right primary fa fa-phone" />
                <span>(202) 851 2332</span>
              </div>
              <div>
                <i className="right primary fa fa-envelope" />
                <a href="mailto:support@docduc.com">support@docduc.com</a>
              </div>
            </Grid>
            <Grid item sm>
              <ContactUs />
            </Grid>
          </Grid>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Home;
