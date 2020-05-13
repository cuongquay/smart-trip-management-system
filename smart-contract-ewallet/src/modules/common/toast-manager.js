import React, { Component } from 'react';
import RootSiblings from 'react-native-root-siblings';
import ToastContainer, { positions, durations } from './toast-container';

let count = 0;
let debounce = true;

class Toast extends Component {
  static displayName = 'Toast';
  static propTypes = ToastContainer.propTypes;
  static positions = positions;
  static durations = durations;

  static show = (
    title,
    message,
    type = 'error', // error = red, success = green, info = blue, warn = dark yellow
    options = { position: positions.TOP, duration: durations.SHORT }
  ) => {
    if (!debounce) return;
    debounce = false;
    setTimeout(() => {
      debounce = true;
    }, durations.SHORT);
    count++;
    return new RootSiblings(
      (
        <ToastContainer title={title} type={type} {...options} visible>
          {message}
        </ToastContainer>
      )
    );
  };

  static hide = toast => {
    if (toast instanceof RootSiblings) {
      toast.destroy();
      count--;
      console.log(count);
    } else {
      console.warn(
        `Toast.hide expected a \`RootSiblings\` instance as argument.\nBut got \`${typeof toast}\` instead.`
      );
    }
  };

  componentWillMount = () => {
    this._toast = new RootSiblings(
      <ToastContainer {...this.props} duration={0} />
    );
  };

  componentWillReceiveProps = nextProps => {
    this._toast.update(<ToastContainer {...nextProps} duration={0} />);
  };

  componentWillUnmount = () => {
    if (this._toast) this._toast.destroy();
  };

  _toast = null;

  render() {
    return null;
  }
}

export { RootSiblings as Manager };
export default Toast;
