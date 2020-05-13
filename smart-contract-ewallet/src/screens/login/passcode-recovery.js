import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { I18n, ToastManager } from 'common';
import {
  Text,
  Colors,
  GradientLayout,
  setLoadingView,
  VirtualKeyboard,
  VirtualKeyboardTypes
} from 'common/ui';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import { verticalScale } from 'react-native-size-matters';
import {
  validateEmail,
  validatePhoneNumber,
  getExceptionMessage
} from 'utilities';
import _ from 'lodash';
import { ButtonBlank, ButtonBack } from 'common/ui/header';
import { apiPasscode } from 'apis/api-passcode';
import _styles from './_styles';
const { width } = Dimensions.get('window');

class PasscodeRecovery extends Component {
  static navigationOptions = ({ navigation }) => {
    console.log(navigation);
    const { goBack } = navigation;
    const { params } = navigation.state;

    return {
      headerLeft: params.phone_number ? (
        <ButtonBack onPress={() => goBack()} />
      ) : (
        <ButtonBlank />
      ),
      headerRight: <ButtonBlank />,
      headerBackTitle: '',
      headerBackTitleStyle: {
        opacity: 0
      },
      headerTruncatedBackTitle: '',
      headerTintColor: Colors.WHITE
    };
  };

  constructor(props) {
    super(props);
    const { params } = props.navigation.state;
    console.log(params);
    this.state = {
      switchable: params.reset_phone && params.reset_email,
      address: '',
      mode: params.reset_email
        ? params.reset_phone
          ? 'phone'
          : 'email'
        : 'phone'
    };
  }

  onResponderRelease = () => {
    const { address } = this.state;
    if (!address.trim()) {
      const { title, message } = I18n.t('errors.BackupAddressNotEntered');
      return ToastManager.show(title, message);
    }
    if (!validateEmail(address) && !validatePhoneNumber(address)) {
      const { title, message } = I18n.t('errors.InvalidResetAddress');
      return ToastManager.show(title, message);
    }
  };

  onKeyPress(keys, value /*eslint-disable-line no-unused-vars*/) {
    this.setState({ address: keys });
  }

  async onSubmit() {
    const { navigation } = this.props;
    const { address } = this.state;
    const { params } = navigation.state;
    if (validateEmail(address) || validatePhoneNumber(address)) {
      // Người dùng đang khôi phục passcode của mình.
      try {
        setLoadingView(true);
        const resp = await apiPasscode.resetPasscodeRequest(
          address,
          params.phone_number
        );
        console.log(resp);
        setLoadingView(false);
        if (resp.request_id) {
          navigation.navigate('PasscodeLockScreen', {
            request_id: resp.request_id,
            reset_address: address,
            phone_number: params.phone_number
          });
        } else {
          const { title, message } = getExceptionMessage(resp.code);
          ToastManager.show(title, message);
        }
      } catch (e) {
        console.log(e);
        setLoadingView(false);
      }
    } else {
      const { title, message } = I18n.t('errors.InvalidResetAddress');
      return ToastManager.show(title, message);
    }
  }

  onSwitchMode() {
    const { mode } = this.state;
    this.setState({
      mode: mode === 'phone' ? 'email' : 'phone'
    });
    this.headingText.bounceIn();
    this.switcher.bounceIn();

    // this.input.blur();
    this.setState({ address: '' });
    if (this.state.mode != 'phone') {
      // setTimeout(() => this.input.focus(), 700);
    }
  }

  render() {
    const { switchable, address, mode } = this.state;
    return (
      <GradientLayout
        scrollEnabled={false}
        contentContainerStyle={styles.container}
        onResponderRelease={this.onResponderRelease}
        keyboardShouldPersistTaps="handled"
      >
        <View style={_styles.placeholder} />
        <Animatable.View ref={ref => (this.headingText = ref)}>
          <Text style={_styles.subtitle}>
            {I18n.t(
              mode === 'phone'
                ? 'passcode_recovery.enter_phone_backup'
                : 'passcode_recovery.enter_email_backup'
            )}
          </Text>
        </Animatable.View>
        <View style={styles.inputPhone}>
          <Text style={styles.textPhone}>{address}</Text>
          <Text style={styles.visible}>{`|`}</Text>
        </View>
        {!__DEV__ &&
          switchable && (
            <Animatable.View ref={ref => (this.switcher = ref)}>
              <Text
                style={styles.addressSwitcher}
                onPress={() => this.onSwitchMode()}
              >
                {I18n.t(
                  mode === 'phone'
                    ? 'passcode_recovery.use_backup_email'
                    : 'passcode_recovery.use_backup_phone'
                )}
              </Text>
            </Animatable.View>
          )}
        <View style={styles.input}>
          {mode !== 'phone' ? (
            <View>
              <TouchableOpacity
                onPress={() => this.onSubmit()}
                style={styles.buttonNext}
              >
                <Text style={styles.buttonText}>Tiếp tục</Text>
              </TouchableOpacity>
              <VirtualKeyboard
                onDataValidated={() => this.onSubmit()}
                onPress={(keys, code) => this.onKeyPress(keys, code)}
                keyboardType={VirtualKeyboardTypes.QWERTY_KEYBOARD}
              />
            </View>
          ) : (
            <VirtualKeyboard
              validateData={() => {
                if (_.startsWith(this.state.address, '01')) {
                  if (this.state.address.length >= 11) {
                    if (!validatePhoneNumber(this.state.address)) {
                      const { title, message } = I18n.t(
                        'errors.IncorrectFormatPhoneNumberException'
                      );
                      ToastManager.show(title, message);
                    } else {
                      return true;
                    }
                  }
                  return false;
                } else {
                  if (this.state.address.length >= 10) {
                    if (!validatePhoneNumber(this.state.address)) {
                      const { title, message } = I18n.t(
                        'errors.IncorrectFormatPhoneNumberException'
                      );
                      ToastManager.show(title, message);
                    } else {
                      return true;
                    }
                  }
                  return false;
                }
              }}
              onDataValidated={() => this.onSubmit()}
              onPress={(keys, code) => this.onKeyPress(keys, code)}
              keyboardType={VirtualKeyboardTypes.FLASH_NUMERIC}
            />
          )}
        </View>
      </GradientLayout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },
  input: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: 'flex-end'
  },
  inputPhone: {
    width: Dimensions.get('window').width * (4 / 5),
    height: Platform.OS === 'ios' ? 32 : 42,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.BLACK
  },
  buttonNext: {
    width: width,
    color: Colors.WHITE,
    marginBottom: 6,
    backgroundColor: Colors.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(50)
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700'
  },
  addressSwitcher: {
    fontSize: 16,
    color: Colors.BLACK,
    textAlign: 'center'
  },
  textPhone: {
    textAlign: 'center',
    fontSize: 18
  },
  visible: {
    fontSize: 20,
    opacity: 1
  }
});

export default connect()(PasscodeRecovery);
