'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, PanResponder, Animated } from 'react-native';

export const SlideDirection = {
  LEFT: 'left',
  RIGHT: 'right',
  BOTH: 'both'
};

export class SlideButton extends Component {
  constructor(props) {
    super(props);
    this.buttonWidth = 0;
    this.state = {
      initialX: 0,
      dx: 0,
      animatedX: new Animated.Value(0),
      released: false
    };
  }

  componentWillMount() {
    var self = this;

    // TODO: Raise error if slideDirection prop is invalid.

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {},

      onPanResponderMove: (
        evt /*eslint-disable-line no-unused-vars*/,
        gestureState
      ) => {
        self.setState({
          locationX: evt.nativeEvent.locationX,
          dx: gestureState.dx
        });
        self.onSlide(gestureState.dx);
      },

      onPanResponderRelease: () => {
        if (this.isSlideSuccessful()) {
          // Move the button out
          this.moveButtonOut(() => {
            self.setState({ swiped: true });
            self.props.onSlideSuccess();
          });

          // Slide it back in after 1 sec
          setTimeout(() => {
            self.moveButtonIn(() => {
              self.setState({
                released: false,
                dx: self.state.initialX
              });
            });
          }, 1000);
        } else {
          this.snapToPosition(() => {
            self.setState({
              released: false,
              dx: self.state.initialX
            });
          });
        }
      },

      onPanResponderTerminate: () => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.snapToPosition(() => {
          self.setState({
            released: false,
            dx: self.state.initialX
          });
        });
      },

      onShouldBlockNativeResponder: () => {
        // Returns whether this component should block native components from
        // becoming the JS responder. Returns true by default. Is currently only
        // supported on android.
        return true;
      }
    });
  }

  onSlide(x) {
    if (this.props.onSlide) {
      this.props.onSlide(x);
    }
  }

  /* Button movement of > 40% is considered a successful slide */
  isSlideSuccessful() {
    if (!this.props.slideDirection) {
      return this.state.dx > this.buttonWidth * 0.4; // Defaults to right slide
    } else if (this.props.slideDirection === SlideDirection.RIGHT) {
      return this.state.dx > this.buttonWidth * 0.4;
    } else if (this.props.slideDirection === SlideDirection.LEFT) {
      return this.state.dx < -(this.buttonWidth * 0.4);
    } else if (this.props.slideDirection === SlideDirection.BOTH) {
      return Math.abs(this.state.dx) > this.buttonWidth * 0.4;
    }
  }

  onSlideSuccess() {
    if (this.props.onSlideSuccess !== undefined) {
      this.props.onSlideSuccess();
    }
  }

  moveButtonIn(onCompleteCallback) {
    var self = this;
    var startPos =
      this.state.dx < 0
        ? this.state.initialX + this.buttonWidth
        : this.state.initialX - this.buttonWidth;
    var endPos = this.state.initialX;

    this.setState(
      {
        released: true,
        animatedX: new Animated.Value(startPos)
      },
      () => {
        Animated.timing(self.state.animatedX, { toValue: endPos }).start(
          onCompleteCallback
        );
      }
    );
  }

  moveButtonOut(onCompleteCallback) {
    var self = this;
    var startPos = this.state.initialX + this.state.dx;
    var endPos = this.state.dx < 0 ? -this.buttonWidth : this.buttonWidth * 2;

    this.setState(
      {
        released: true,
        animatedX: new Animated.Value(startPos)
      },
      () => {
        Animated.timing(self.state.animatedX, { toValue: endPos }).start(
          onCompleteCallback
        );
      }
    );
  }

  snapToPosition(onCompleteCallback) {
    var self = this;
    var startPos = this.state.initialX + this.state.dx;
    var endPos = this.state.initialX;

    this.setState(
      {
        released: true,
        animatedX: new Animated.Value(startPos)
      },
      () => {
        Animated.timing(self.state.animatedX, { toValue: endPos }).start(
          onCompleteCallback
        );
      }
    );
  }

  onLayout(event) {
    console.log(event);
  }

  render() {
    var style = [styles.button, this.props.style, { left: this.state.dx }];
    var button = (
      <View style={style}>
        <View onLayout={this.onLayout}>{this.props.children}</View>
      </View>
    );
    if (this.state.released) {
      style = [styles.button, this.props.style, { left: this.state.animatedX }];
      button = (
        <Animated.View style={style}>{this.props.children}</Animated.View>
      );
    }

    return (
      <View style={styles.container} {...this.panResponder.panHandlers}>
        {button}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  button: {
    position: 'relative'
  }
});
