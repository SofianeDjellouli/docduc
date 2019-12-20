export const isLarge = window.innerWidth > 1500;

export const chipStyles = theme => ({
  root: {
    margin: "8px 2px",
    width: "calc(33.33% - 4px)",
    backgroundImage: "url(/img/capsule_orange1.png)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    backgroundColor: "transparent",
    fontFamily: "Open Sans Regular",
    fontSize: 18,
    color: "#f2f2f2",
    boxShadow: "grey 0px 26px 75px -8px",
    zIndex: 1,
    justifyContent: "space-between",
    height: isLarge ? 60 : null,
    borderRadius: isLarge ? 30 : null
  },
  label: { textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", display: "block" },
  deleteIcon: { width: isLarge ? "1em" : "0.5em" }
});
