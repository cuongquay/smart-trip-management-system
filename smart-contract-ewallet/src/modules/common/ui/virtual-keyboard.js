import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { Icon } from 'react-native-elements';
import Colors from './colors';
import Text from './text-react-native';
import {
  DefaultSpecialCodes /*eslint-disable-line no-unused-vars*/,
  VirtualKeyboardTypes /*eslint-disable-line no-unused-vars*/,
  NumericOnlyLayout /*eslint-disable-line no-unused-vars*/,
  FlashNumericLayout /*eslint-disable-line no-unused-vars*/,
  QwertyNumericLayout /*eslint-disable-line no-unused-vars*/,
  ExtendedNumericLayout /*eslint-disable-line no-unused-vars*/,
  ExtendedPhoneLayout /*eslint-disable-line no-unused-vars*/,
  ExtendedCurrencyLayout /*eslint-disable-line no-unused-vars*/,
  AlphabetLowerCaseLayout /*eslint-disable-line no-unused-vars*/,
  AlphabetUpperCaseLayout /*eslint-disable-line no-unused-vars*/
} from './virtual-keyboard-layouts';

class VirtualKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyPressed: false
    };
  }

  render() {
    const {
      keyObject,
      specialCodes,
      onPress,
      buttonStyle,
      textStyle,
      iconStyle,
      iconSize,
      keyboardType,
      pressedDelayTime,
      onDataValidated,
      validateData,
      buttonHeight,
      buttonWidth,
      marginHorizontal
    } = this.props;
    const keyCode = typeof keyObject === 'object' ? keyObject.code : keyObject;
    const specialButtonStyle =
      keyCode === '' || specialCodes.indexOf(keyCode) !== -1;
    const specialButtonWithIcon = specialCodes.indexOf(keyCode) !== -1;
    let iconName = 'ios-backspace-outline';
    const iconType =
      typeof keyObject === 'object'
        ? keyObject.iconType || 'ionicon'
        : 'ionicon';
    if (iconType === 'ionicon') {
      iconName = 'ios-' + keyCode + (this.state.keyPressed ? '' : '-outline');
    }
    return (
      <TouchableOpacity
        key={Math.random()}
        activeOpacity={0.8}
        style={[
          styles.buttonWrapper,
          {
            height: buttonHeight || 70,
            width: buttonWidth || 80,
            marginHorizontal: marginHorizontal || 0
          },
          keyboardType === VirtualKeyboardTypes.QWERTY_KEYBOARD
            ? styles.buttonAlphabetWrapper
            : styles.buttonNumericWrapper,
          buttonStyle ? buttonStyle : {},
          typeof keyObject === 'object' ? keyObject.buttonStyle : {},
          this.state.keyPressed || specialButtonStyle
            ? styles.buttonWithoutBorder
            : {},
          this.state.keyPressed && !specialButtonStyle
            ? styles.buttonHightlightedColor
            : {}
        ]}
        onPress={() => {
          if (!this.state.keyPressed) {
            this.setState({ keyPressed: true });
            setTimeout(() => {
              this.setState({ keyPressed: false });
              if (onPress(keyCode, !specialButtonStyle)) {
                if (validateData && validateData(keyCode)) {
                  if (
                    onDataValidated &&
                    typeof onDataValidated !== 'undefined'
                  ) {
                    onDataValidated();
                  }
                }
              }
            }, pressedDelayTime || 0);
          }
        }}
      >
        {specialButtonWithIcon ? (
          <Icon
            type={iconType}
            name={iconName}
            size={
              iconSize ||
              (keyboardType === VirtualKeyboardTypes.QWERTY_KEYBOARD
                ? scale(28)
                : scale(32))
            }
            color={Colors.WHITE}
            iconStyle={[
              iconStyle ? iconStyle : {},
              typeof keyObject === 'object' ? keyObject.iconStyle : {}
            ]}
          />
        ) : (
          <Text
            regular
            style={[
              keyboardType === VirtualKeyboardTypes.QWERTY_KEYBOARD
                ? styles.buttonAlphabetText
                : styles.buttonNumericText,
              textStyle ? textStyle : {},
              typeof keyObject === 'object' ? keyObject.textStyle : {},
              this.state.keyPressed ? styles.buttonHightlightedText : {}
            ]}
          >
            {keyCode}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
}

class VirtualKeyboard extends Component {
  constructor(props) {
    super(props);
    let calculatedLayout = NumericOnlyLayout;
    switch (props.keyboardType) {
      case VirtualKeyboardTypes.FLASH_NUMERIC:
        calculatedLayout = FlashNumericLayout;
        break;
      case VirtualKeyboardTypes.ALPHA_NUMERIC:
        calculatedLayout = ExtendedNumericLayout;
        break;
      case VirtualKeyboardTypes.EXTENDED_PHONE:
        calculatedLayout = ExtendedNumericLayout;
        break;
      case VirtualKeyboardTypes.EXTENDED_CURRENCY:
        calculatedLayout = ExtendedNumericLayout;
        break;
      case VirtualKeyboardTypes.EXTENDED_NUMERIC:
        calculatedLayout = ExtendedNumericLayout;
        break;
      case VirtualKeyboardTypes.QWERTY_KEYBOARD:
        calculatedLayout = AlphabetLowerCaseLayout;
        break;
      default:
        calculatedLayout = NumericOnlyLayout;
    }
    this.state = {
      keyboardLayout: props.customLayout || calculatedLayout,
      keyboardType: props.keyboardType || VirtualKeyboardTypes.ALPHA_NUMERIC,
      defaultKeyboardLayout: calculatedLayout,
      defaultKeyboardType:
        props.keyboardType || VirtualKeyboardTypes.ALPHA_NUMERIC,
      keys: ''
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.clearState) {
      this.setState({ keys: '' });
    }
  }
  handleKeyPressing(value, maxLength) {
    let clientNotify = false;
    let nextKKeyboardLayout = NumericOnlyLayout;
    let nextKeyboardType = VirtualKeyboardTypes.NUMERIC_ONLY;
    const {
      defaultKeyboardLayout,
      defaultKeyboardType,
      keyboardType
    } = this.state;
    switch (value) {
      case 'backspace':
        this.setState({ keys: this.state.keys.slice(0, -1) });
        clientNotify = true;
        break;
      case 'flash':
      case 'trash':
        this.setState({ keys: '' });
        clientNotify = true;
        break;
      case 'space':
        this.setState({ keys: this.state.keys + ' ' });
        clientNotify = true;
        break;
      case 'more':
        nextKKeyboardLayout = defaultKeyboardLayout;
        nextKeyboardType = defaultKeyboardType;
        if (keyboardType === VirtualKeyboardTypes.ALPHA_NUMERIC) {
          nextKKeyboardLayout = AlphabetUpperCaseLayout;
          nextKeyboardType = VirtualKeyboardTypes.QWERTY_KEYBOARD;
        } else if (keyboardType === VirtualKeyboardTypes.EXTENDED_PHONE) {
          nextKKeyboardLayout = ExtendedPhoneLayout;
        } else if (keyboardType === VirtualKeyboardTypes.FLASH_NUMERIC) {
          nextKKeyboardLayout = FlashNumericLayout;
        } else if (keyboardType === VirtualKeyboardTypes.EXTENDED_CURRENCY) {
          nextKKeyboardLayout = ExtendedCurrencyLayout;
        } else if (keyboardType === VirtualKeyboardTypes.EXTENDED_NUMERIC) {
          nextKKeyboardLayout = ExtendedNumericLayout;
        } else {
          nextKKeyboardLayout = NumericOnlyLayout;
        }
        this.setState({
          keyboardLayout: nextKKeyboardLayout,
          keyboardType: nextKeyboardType
        });
        break;
      case 'arrow-dropdown':
        this.setState({
          keyboardLayout: AlphabetLowerCaseLayout,
          keyboardType: VirtualKeyboardTypes.QWERTY_KEYBOARD
        });
        break;
      case 'arrow-dropup':
        this.setState({
          keyboardLayout: AlphabetUpperCaseLayout,
          keyboardType: VirtualKeyboardTypes.QWERTY_KEYBOARD
        });
        break;
      case 'keypad':
        this.setState({
          keyboardLayout: defaultKeyboardLayout,
          keyboardType: defaultKeyboardType
        });
        break;
      case 'abc':
        nextKKeyboardLayout = defaultKeyboardLayout;
        nextKeyboardType = defaultKeyboardType;
        if (keyboardType === VirtualKeyboardTypes.QWERTY_NUMERIC) {
          nextKKeyboardLayout = AlphabetLowerCaseLayout;
          nextKeyboardType = VirtualKeyboardTypes.QWERTY_KEYBOARD;
        }
        this.setState({
          keyboardLayout: nextKKeyboardLayout,
          keyboardType: nextKeyboardType
        });
        break;
      case '123':
        nextKKeyboardLayout = defaultKeyboardLayout;
        nextKeyboardType = defaultKeyboardType;
        if (keyboardType === VirtualKeyboardTypes.QWERTY_KEYBOARD) {
          nextKKeyboardLayout = QwertyNumericLayout;
          nextKeyboardType = VirtualKeyboardTypes.QWERTY_NUMERIC;
        }
        this.setState({
          keyboardLayout: nextKKeyboardLayout,
          keyboardType: nextKeyboardType
        });
        break;
      default:
        if (this.state.keys.length < maxLength) {
          this.setState({ keys: this.state.keys + value });
          clientNotify = true;
        }
    }
    return clientNotify;
  }

  render() {
    const {
      onPress,
      specialCodes,
      buttonStyle,
      textStyle,
      iconStyle,
      iconSize,
      maxInputLength,
      pressedDelayTime,
      onDataValidated,
      validateData,
      buttonHeight,
      buttonWidth
    } = this.props;
    return (
      <View style={styles.container}>
        {this.state.keyboardLayout.map(row => (
          <View
            key={Math.random()}
            style={[
              styles.rowWrapper,
              {
                marginVertical:
                  this.state.keyboardType ===
                  VirtualKeyboardTypes.QWERTY_KEYBOARD
                    ? 8
                    : 0
              }
            ]}
          >
            {row.map(btn => (
              <VirtualKey
                key={Math.random()}
                keyObject={btn}
                buttonStyle={buttonStyle}
                textStyle={textStyle}
                iconStyle={iconStyle}
                iconSize={iconSize}
                keyboardType={
                  this.state.keyboardType || VirtualKeyboardTypes.ALPHA_NUMERIC
                }
                specialCodes={specialCodes || DefaultSpecialCodes}
                validateData={validateData}
                pressedDelayTime={pressedDelayTime || 0}
                onDataValidated={() => onDataValidated(this.state.keys)}
                onPress={(code, validate) => {
                  if (this.handleKeyPressing(code, maxInputLength || 512)) {
                    const wantedValidate = onPress(
                      this.state.keys,
                      code,
                      validate
                    );
                    return typeof wantedValidate === 'undefined' && validate
                      ? true
                      : wantedValidate;
                  }
                  return false;
                }}
                buttonWidth={scale(buttonWidth)}
                buttonHeight={verticalScale(buttonHeight)}
                marginHorizontal={scale(
                  this.state.keyboardType ===
                  VirtualKeyboardTypes.QWERTY_KEYBOARD
                    ? 2
                    : 20
                )}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }
}

VirtualKeyboard.defaultProps = {
  onPress: k => console.log(k),
  onDataValidated: () => {}
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    maxHeight: height * 0.48
  },
  rowWrapper: {
    flexDirection: 'row'
  },
  buttonWrapper: {
    borderWidth: 0,
    borderRadius: scale(40),
    borderColor: Colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonAlphabetWrapper: {
    height: scale(45),
    width: scale(30)
  },
  buttonNumericWrapper: {
    borderRadius: scale(40),
    width: scale(75),
    height: scale(70)
  },
  buttonNumericText: {
    color: Colors.WHITE,
    fontSize: scale(26)
  },
  buttonAlphabetText: {
    fontSize: scale(20),
    color: Colors.WHITE
  },
  buttonHightlightedColor: {
    borderColor: Colors.WHITE,
    backgroundColor: Colors.WHITE
  },
  buttonWithoutBorder: {
    borderWidth: 0
  },
  buttonHightlightedText: {
    color: Colors.WHITE
  }
});

export {
  VirtualKeyboard,
  VirtualKeyboardTypes /*eslint-disable-line no-unused-vars*/,
  NumericOnlyLayout /*eslint-disable-line no-unused-vars*/,
  FlashNumericLayout /*eslint-disable-line no-unused-vars*/,
  ExtendedNumericLayout /*eslint-disable-line no-unused-vars*/,
  ExtendedPhoneLayout /*eslint-disable-line no-unused-vars*/,
  ExtendedCurrencyLayout /*eslint-disable-line no-unused-vars*/,
  AlphabetLowerCaseLayout /*eslint-disable-line no-unused-vars*/,
  AlphabetUpperCaseLayout /*eslint-disable-line no-unused-vars*/
};
