import React, { Component } from "react";

const PatientHOCWrapper = ComposedComponent => {
  class PatientHOC extends Component {
    state = { photoIndex: 0, isOpen: false };

    handleClickImage = photoIndex => this.setState({ isOpen: true, photoIndex });

    handleCloseRequest = () => this.setState({ isOpen: false });

    handleMovePrevRequest = () => {
      const { photoIndex } = this.state,
        { file_link } = this.props;
      this.setState({ photoIndex: (photoIndex + file_link.length - 1) % file_link.length });
    };

    handleMoveNextRequest = () => {
      const { photoIndex } = this.state,
        { file_link } = this.props;
      this.setState({ photoIndex: (photoIndex + 1) % file_link.length });
    };

    render() {
      return (
        <ComposedComponent
          {...this.state}
          {...this.props}
          onClickImage={this.handleClickImage}
          onCloseRequest={this.handleCloseRequest}
          onMovePrevRequest={this.handleMovePrevRequest}
          onMoveNextRequest={this.handleMoveNextRequest}
        />
      );
    }
  }

  return PatientHOC;
};

export default PatientHOCWrapper;
