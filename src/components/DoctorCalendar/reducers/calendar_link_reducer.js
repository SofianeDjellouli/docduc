import { CALENDAR_LINK } from "../actions";

export default (state = "", { type, payload }) => {
  switch (type) {
    case CALENDAR_LINK:
      return payload;
    default:
      return state;
  }
};
