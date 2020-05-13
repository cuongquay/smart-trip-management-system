import React from 'react';
import { AppState, StyleSheet } from 'react-native';
import moment from 'moment';
import { I18n } from 'common';
import Text from './text-react-native';

const DURATION = __DEV__ ? 5 : 60; // Seconds.

class CountdownText extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: DURATION
    };
  }

  componentDidMount() {
    this.startCountdown();
    AppState.addEventListener('change', state => {
      if (state === 'active') {
        // Resume...
        const pausedTime = moment(new Date()).diff(this.momentThen, 'seconds');
        console.log(pausedTime);
        if (0 <= this.state.counter) {
          if (pausedTime > this.state.counter) {
            // Halt immediately.
            !this.unmounted && this.halt();
          } else {
            this.setState({ counter: this.state.counter - pausedTime });
          }
        } else {
          !this.unmounted && this.halt();
        }
      } else {
        // Pause...
        if (this.state.counter > 0) {
          this.momentThen = new Date();
        }
      }
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.halt();
  }

  halt() {
    const { onReachedZero } = this.props;
    onReachedZero();
    this.stopCountdown();
    this.setState({ counter: 0 });
  }

  startCountdown() {
    const { onReachedZero, autoLoop } = this.props;
    this.setState({ counter: DURATION });
    this.countdown = setInterval(() => {
      this.setState(prevState => {
        if (prevState.counter === 0) {
          /* Fire an event and do a next round... */
          onReachedZero();
          if (autoLoop) {
            this.stopCountdown();
            this.startCountdown();
          }
        }
        return { counter: prevState.counter - 1 };
      });
    }, 1000);
  }

  stopCountdown() {
    this.countdown && clearInterval(this.countdown);
  }

  render() {
    const { counter } = this.state;
    const { style, stringTemplate } = this.props;
    return (
      <Text style={[styles.note, style]}>
        {I18n.t(stringTemplate || 'confirmation.auto_refresh_after', {
          counter
        })}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  note: {
    marginTop: 18
  }
});

export default CountdownText;
