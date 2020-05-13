import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Colors from './ui/colors';
import {
  ViewPropTypes,
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Easing,
  Keyboard,
  Platform
} from 'react-native';

const TOAST_ANIMATION_DURATION = 200;
const DIMENSION = Dimensions.get('window');
let KEYBOARD_HEIGHT = 0;

Keyboard.addListener('keyboardDidChangeFrame', function({ endCoordinates }) {
  KEYBOARD_HEIGHT = DIMENSION.height - endCoordinates.screenY;
});

const WINDOW_WIDTH = DIMENSION.width;
const positions = {
  TOP: Platform.OS === 'ios' ? 1 : 1,
  CENTER: 0
};

const durations = {
  LONG: 3500,
  SHORT: 2000
};

let styles = StyleSheet.create({
  defaultStyle: {
    position: 'absolute',
    width: WINDOW_WIDTH,
    justifyContent: 'center',
    paddingVertical: 2,
    alignItems: 'center',
    zIndex: 9900,
    paddingTop: 20
  },
  containerStyle: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.WHITE,
    backgroundColor: Colors.WHITE,
    opacity: 1,
    width: WINDOW_WIDTH
    //marginHorizontal: WINDOW_WIDTH * ((1 - TOAST_MAX_WIDTH) / 2),
  },
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0,
    shadowRadius: 6,
    elevation: 0
  },
  titleStyle: {
    color: Colors.BLACK
  },
  textStyle: {
    fontSize: 14,
    marginTop: 4,
    color: Colors.BLACK,
    textAlign: 'left'
  }
});

class ToastContainer extends Component {
  static displayName = 'ToastContainer';

  static propTypes = {
    ...ViewPropTypes,
    containerStyle: ViewPropTypes.style,
    duration: PropTypes.number,
    visible: PropTypes.bool,
    type: PropTypes.string,
    position: PropTypes.number,
    animation: PropTypes.bool,
    shadow: PropTypes.bool,
    backgroundColor: PropTypes.string,
    opacity: PropTypes.number,
    shadowColor: PropTypes.string,
    textColor: PropTypes.string,
    textStyle: Text.propTypes.style,
    delay: PropTypes.number,
    hideOnPress: PropTypes.bool,
    onHide: PropTypes.func,
    onHidden: PropTypes.func,
    onShow: PropTypes.func,
    onShown: PropTypes.func
  };

  static defaultProps = {
    visible: false,
    type: 'info',
    duration: durations.SHORT,
    animation: true,
    shadow: true,
    position: positions.BOTTOM,
    opacity: 1,
    delay: 0,
    hideOnPress: true
  };

  constructor() {
    super(...arguments);
    this.state = {
      visible: this.props.visible,
      opacity: new Animated.Value(0)
    };
  }

  componentDidMount = () => {
    if (this.state.visible) {
      this._showTimeout = setTimeout(() => this._show(), this.props.delay);
    }
  };

  componentWillReceiveProps = nextProps => {
    if (nextProps.visible !== this.props.visible) {
      if (nextProps.visible) {
        clearTimeout(this._showTimeout);
        clearTimeout(this._hideTimeout);
        this._showTimeout = setTimeout(() => this._show(), this.props.delay);
      } else {
        this._hide();
      }

      this.setState({
        visible: nextProps.visible
      });
    }
  };

  componentWillUnmount = () => {
    this._hide();
  };

  _animating = false;
  _root = null;
  _hideTimeout = null;
  _showTimeout = null;

  _show = () => {
    clearTimeout(this._showTimeout);
    if (!this._animating) {
      clearTimeout(this._hideTimeout);
      this._animating = true;
      this._root.setNativeProps({
        pointerEvents: 'auto'
      });
      this.props.onShow && this.props.onShow(this.props.siblingManager);
      Animated.timing(this.state.opacity, {
        toValue: this.props.opacity,
        duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
        easing: Easing.out(Easing.ease)
      }).start(({ finished }) => {
        if (finished) {
          this._animating = !finished;
          this.props.onShown && this.props.onShown(this.props.siblingManager);
          if (this.props.duration > 0) {
            this._hideTimeout = setTimeout(
              () => this._hide(),
              this.props.duration
            );
          }
        }
      });
    }
  };

  _hide = () => {
    clearTimeout(this._showTimeout);
    clearTimeout(this._hideTimeout);
    if (!this._animating) {
      this._root.setNativeProps({
        pointerEvents: 'none'
      });
      this.props.onHide && this.props.onHide(this.props.siblingManager);
      Animated.timing(this.state.opacity, {
        toValue: 0,
        duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
        easing: Easing.in(Easing.ease)
      }).start(({ finished }) => {
        if (finished) {
          this._animating = false;
          this.props.onHidden && this.props.onHidden(this.props.siblingManager);
        }
      });
    }
  };

  getTitleColor() {
    const { type } = this.props;
    switch (type) {
      case 'error':
        return Colors.RED;
      case 'info':
        return Colors.BLACK;
      default:
        return Colors.BLACK;
    }
  }

  render() {
    let { props } = this;
    let offset = props.position;
    let position = offset
      ? {
          [offset < 0 ? 'bottom' : 'top']:
            offset < 0 ? KEYBOARD_HEIGHT - offset : offset
        }
      : {
          top: 0,
          bottom: KEYBOARD_HEIGHT
        };

    return this.state.visible || this._animating ? (
      <View style={[styles.defaultStyle, position]} pointerEvents="box-none">
        <TouchableWithoutFeedback
          onPress={this.props.hideOnPress ? this._hide : null}
        >
          <Animated.View
            style={[
              styles.containerStyle,
              props.containerStyle,
              props.backgroundColor && {
                backgroundColor: props.backgroundColor
              },
              {
                opacity: this.state.opacity
              },
              props.shadow && styles.shadowStyle,
              props.shadowColor && { shadowColor: props.shadowColor }
            ]}
            pointerEvents="none"
            ref={ele => (this._root = ele)}
          >
            <Text
              style={[styles.titleStyle, { color: this.getTitleColor() }]}
              semiBold
            >
              {this.props.title}
            </Text>
            <Text
              style={[
                styles.textStyle,
                props.textStyle,
                props.textColor && { color: props.textColor }
              ]}
              regular
            >
              {this.props.children}
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    ) : null;
  }
}

export default ToastContainer;
export { positions, durations };
