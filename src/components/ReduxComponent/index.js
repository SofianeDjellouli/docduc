import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import reduxThunk from "redux-thunk";

export const ReduxComponent = ({ ID, reducers, Component, preloadedState = {}, ...props }) => {
  const store = useMemo(
    _ => {
      if (ID)
        return createStore(
          combineReducers(reducers),
          preloadedState,
          (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(applyMiddleware(reduxThunk))
        );
    },
    [ID, reducers, preloadedState]
  );

  return (
    <Provider key={ID} {...{ store }}>
      <Component {...props} />
    </Provider>
  );
};
