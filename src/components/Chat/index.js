import React, { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import Pubnub from "pubnub";
import { ChatApp, VideoApp, ErrorBoundary, ReduxComponent } from "../";
import { getLoginId, getUuid, getPubnubToken, PUBLISH_KEY, SUBSCRIBE_KEY } from "../../utils";
import reducers from "./reducers";
// import { handlePubNubStatus } from "./actions";

const _Chat = ({
  mode,
  closeSnackbar,
  handlePubNubStatus,
  unsubscribeAll,
  addListener,
  removeListener
}) => {
  const isVideo = mode === "video";
  useEffect(() => {
    const listener = { status: console.log /*handlePubNubStatus*/ };
    addListener(listener);
    return _ => {
      removeListener(listener);
      unsubscribeAll();
    };
  }, [addListener, removeListener, handlePubNubStatus, unsubscribeAll]);
  return <ErrorBoundary>{isVideo ? <VideoApp /> : <ChatApp />}</ErrorBoundary>;
};

const Chat = connect(({ mode, pubnub: { unsubscribeAll, addListener, removeListener } }) => ({
  mode,
  unsubscribeAll,
  addListener,
  removeListener
}))(_Chat);

const ConnectedChat = props => {
  const preloadedState = useMemo(
    _ => ({
      pubnub: (_ => {
        const pubnub = new Pubnub({
            publishKey: PUBLISH_KEY,
            subscribeKey: SUBSCRIBE_KEY,
            uuid: getUuid(),
            //Amount of seconds the user will announce itself to the server
            heartbeatInterval: 5,
            authKey: getPubnubToken()
          }),
          { addListener, removeListener, unsubscribeAll } = pubnub;
        pubnub.subscribe({ channels: [getLoginId()] });
        return {
          addListener,
          removeListener,
          unsubscribeAll,
          publish: (type, channel, rest) =>
            pubnub.publish(
              { message: { type, ...rest }, channel, storeInHistory: false },
              ({ error, ...status }) => {
                if (error) console.error(status);
              }
            )
        };
      })()
    }),
    []
  );
  return <ReduxComponent Component={Chat} {...{ reducers, preloadedState, ...props }} />;
};

export default ConnectedChat;
