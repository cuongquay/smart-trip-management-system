/**
 * @flow
 * Màn hình nhập passcode để vào app.
 */

import React, { Component } from 'react';
import {
  StatusBar,
  Image,
  StyleSheet,
  DeviceEventEmitter,
  Dimensions,
  View
} from 'react-native';
import { Events, I18n, setLoadingView, ToastManager } from 'common';
import { connect } from 'react-redux';
import {
  Text,
  Colors,
  GradientLayout,
  VirtualKeyboard,
  VirtualKeyboardTypes,
  MaskedCode,
  CountdownText
} from 'common/ui';

import { apiAuthenticate } from 'apis/api-authenticate';
import { saveUserData } from 'actions/actions-user';
import { reset } from 'actions/actions-navigation';
import { setToken } from 'apis';
import { getExceptionMessage, getCachedDeviceInfo } from 'utilities';

const { width } = Dimensions.get('window');

class PasscodeConfirmation extends Component {
  static navigationOptions = () => {
    return { header: null };
  };

  constructor(props) {
    super(props);
    this.state = {
      showCounter: props.navigation.state.params.verify_mode === 'OTP',
      code: ''
    };
  }

  onUpdateCode(keys, code /*eslint-disable-line no-unused-vars*/) {
    this.setState({ code: keys });
  }

  onForgot() {
    const { navigation } = this.props;
    const { params } = navigation.state;
    // Sang màn quên mã khoá.
    navigation.navigate('PasscodeRecoveryScreen', {
      phone_number: params.phone_number,
      reset_email: params.reset_email,
      reset_phone: params.reset_phone
    });
  }

  onReEnter() {
    const { navigation } = this.props;
    navigation.dispatch(reset(['PasscodeScreen']));
    DeviceEventEmitter.emit(Events.RELOAD_PHONE_NUMBER);
  }

  onReachedZero() {
    this.setState({ showCounter: false });
  }

  async onResend() {
    const { navigation } = this.props;
    const { params } = navigation.state;
    console.log(this.props);
    try {
      this.setState({ showCounter: true });
      const resp = await apiAuthenticate.loginRequest({
        phone_number: params.phone_number,
        device_info: getCachedDeviceInfo()
      });
      console.log(resp);
      navigation.setParams({
        phone_number: params.phone_number,
        ...resp
      });
    } catch (e) {
      console.log(e);
    }
  }

  onSubmit() {
    const { navigation } = this.props;
    const { params } = navigation.state;
    const data = {
      customer_id: params.customer_id,
      request_id: params.request_id,
      verify_mode: params.verify_mode,
      access_code: this.state.code,
      login_log_id: params.login_log_id
    };
    if (params.verify_mode === 'PASSCODE') {
      this.asPasscode(data);
    } else {
      this.asOTP(data);
    }
  }

  async asPasscode(data) {
    const { navigation, dispatch } = this.props;
    try {
      setLoadingView(true);
      const resp = await apiAuthenticate.loginVerify(data);
      setLoadingView(false);
      console.log(resp);
      if (resp.customer) {
        setToken(resp.token);
        dispatch(saveUserData(resp));
        navigation.dispatch(reset(['HomeScreen']));
      } else {
        this.resetCode();
        const { title, message } = getExceptionMessage(
          'LoginVerifyIncorrectCodeExceptionPasscode',
          resp.message
        );
        ToastManager.show(title, message);
      }
    } catch (e) {
      console.log(e);
      setLoadingView(false);
    }
  }

  async asOTP(data) {
    const { navigation } = this.props;
    const { params } = navigation.state;
    try {
      setLoadingView(true);
      console.log(data);
      const resp = await apiAuthenticate.loginVerify(data);
      setLoadingView(false);
      console.log(resp);
      if (resp.customer) {
        setToken(resp.token);
        navigation.dispatch(
          reset(['PasscodeSetupScreen'], {
            phone_number: params.phone_number,
            user: resp
          })
        );
      } else if (resp.code) {
        this.resetCode();
        const { title, message } = getExceptionMessage(
          'LoginVerifyIncorrectCodeExceptionOTP',
          resp.message
        );
        ToastManager.show(title, message);
      }
    } catch (e) {
      console.log(e);
      setLoadingView(false);
    }
  }

  resetCode() {
    this.setState({ code: '' });
  }

  render() {
    const { code, showCounter } = this.state;
    const { navigation } = this.props;
    const {
      params: { verify_mode }
    } = navigation.state;

    return (
      <GradientLayout style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Image
          source={require('assets/home/logo.png')}
          resizeMode="contain"
          style={[
            styles.logo,
            {
              opacity: verify_mode === 'PASSCODE' ? 1 : 0
            }
          ]}
        />
        <Text regular style={styles.headingText}>
          {I18n.t(
            verify_mode === 'PASSCODE'
              ? 'confirmation.hello'
              : 'confirmation.hello2'
          )}
        </Text>
        <MaskedCode
          dashed={navigation.state.params.verify_mode === 'OTP'}
          value={code}
        />{' '}
        {verify_mode === 'OTP' && showCounter ? (
          <CountdownText
            ref={ref => (this.counter = ref)}
            style={styles.countdown}
            stringTemplate="confirmation.code_receive_after"
            onReachedZero={() => this.onReachedZero()}
          />
        ) : (
          <Text style={styles.countdownReplacement}>{`A`}</Text>
        )}
        <View style={styles.functionText}>
          {verify_mode === 'PASSCODE' ? (
            <Text semiBold style={styles.text} onPress={() => this.onForgot()}>
              {I18n.t('confirmation.forgot_passcode')}
            </Text>
          ) : (
            <Text
              semiBold
              suppressHighlighting
              style={[styles.text, showCounter ? styles.grayText : {}]}
              onPress={() => !showCounter && this.onResend()}
            >
              {I18n.t('confirmation.requested_code_again')}
            </Text>
          )}
          <Text semiBold style={styles.text} onPress={() => this.onReEnter()}>
            {I18n.t('confirmation.enter_another_number')}
          </Text>
        </View>
        <VirtualKeyboard
          validateData={() => {
            return this.state.code.length >= 6;
          }}
          clearState={this.state.code === '' ? true : false}
          onDataValidated={keys => this.onSubmit(keys)}
          onPress={(keys, code) => this.onUpdateCode(keys, code)}
          keyboardType={VirtualKeyboardTypes.FLASH_NUMERIC}
        />
      </GradientLayout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingBottom: 12,
    paddingTop: 24
  },
  logo: {
    width: width / 4,
    height: 54,
    marginVertical: 12
  },
  countdown: {
    marginTop: 18,
    fontSize: 16,
    color: Colors.BLACK
  },
  countdownReplacement: {
    opacity: 0,
    marginTop: 18
  },
  headingText: {
    fontSize: 19,
    marginBottom: 18
  },
  functionText: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 54,
    marginBottom: 12
  },
  text: {
    color: Colors.BLACK,
    fontSize: 17
  },
  grayText: {
    color: Colors.BLACK
  }
});

export default connect()(PasscodeConfirmation);
