import React, { Component } from 'react';
import { StyleSheet, Platform, Keyboard } from 'react-native';
import { I18n, setLoadingView, ToastManager } from 'common';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors, Text, MaterialInput, ButtonBottom } from 'common/ui';
import { saveUserData } from 'actions/actions-user';
import { reset } from 'actions/actions-navigation';
import { apiPasscode } from 'apis/api-passcode';
import { apiAuthenticate } from 'apis/api-authenticate';
import {
  getCachedDeviceInfo,
  getExceptionMessage,
  validateEmail,
  validatePhoneNumber
} from 'utilities';

import _styles from './_styles';

class PasscodeRecoverySetup extends Component {
  static navigationOptions = () => {
    return { header: null };
  };

  constructor(props) {
    super(props);
    console.log(props);
    this.backupAddress = '';
    this.state = {
      offset: 0,
      phone: '',
      email: ''
    };
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      this.keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        e => this.setState({ offset: e.endCoordinates.height })
      );
      this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => this.setState({ offset: 0 })
      );
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
  }

  onResponderRelease = () => {
    const { phone, email } = this.state;
    if (!phone && !email) {
      const { title, message } = I18n.t('errors.BackupAddressNotEntered');
      return ToastManager.show(title, message);
    }
    if (phone || email) {
      this.checkEmail();
      this.checkPhoneNumber();
    }
  };

  checkEmail = () => {
    if (this.state.email) {
      if (!validateEmail(this.state.email.trim())) {
        const { title, message } = getExceptionMessage('InvalidResetEmail');
        ToastManager.show(title, message);
        return false;
      }
      return true;
    }
    return true;
  };
  checkPhoneNumber = () => {
    if (this.state.phone) {
      if (!validatePhoneNumber(this.state.phone.trim())) {
        const { title, message } = getExceptionMessage('InvalidResetPhone');
        ToastManager.show(title, message);
        return false;
      }
      return true;
    }
    return true;
  };

  async onSubmit() {
    const { phone, email } = this.state;
    if (
      (!phone && email && this.checkEmail()) ||
      (!email && phone && this.checkPhoneNumber()) ||
      (this.checkEmail() && this.checkPhoneNumber() && phone && email)
    ) {
      this.loginWithNewPasscode();
    }
  }

  async loginWithNewPasscode() {
    const { navigation, dispatch } = this.props;
    const { phone, email } = this.state;
    const { phone_number, code } = navigation.state.params;
    setLoadingView(true);
    const resp = await apiPasscode.createPasscode(code, phone, email);
    console.log(resp);
    setLoadingView(false);
    if (!resp.code) {
      const loginRequestResp = await apiAuthenticate.loginRequest({
        phone_number,
        device_info: getCachedDeviceInfo()
      });
      if (!loginRequestResp.code) {
        const {
          customer_id,
          request_id,
          verify_mode,
          login_log_id
        } = loginRequestResp;
        const data = {
          customer_id,
          request_id,
          verify_mode,
          access_code: code,
          login_log_id
        };
        const loginVerifyResp = await apiAuthenticate.loginVerify(data);
        if (loginVerifyResp.customer) {
          dispatch(saveUserData(loginVerifyResp));
          navigation.dispatch(reset(['HomeScreen']));
        }
      }
    } else {
      const { title, message } = getExceptionMessage(resp.code);
      ToastManager.show(title, message);
    }
  }

  render() {
    const { offset, phone, email } = this.state;

    return (
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        onResponderRelease={this.onResponderRelease}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={_styles.subtitle}>
          {I18n.t('passcode_recovery.enter_phone_email_backup')}
        </Text>
        <MaterialInput
          autoCorrect={false}
          value={phone || ''}
          tintColor={Colors.BLACK}
          returnKeyType="next"
          keyboardType="numeric"
          autoCapitalize="none"
          maxLength={11}
          onChangeText={phone => this.setState({ phone })}
          onClear={() => this.setState({ phone: '' })}
          label={I18n.t('passcode_recovery.backup_phone')}
          showIcon={phone ? true : false}
        />
        <MaterialInput
          autoCorrect={false}
          value={email || ''}
          tintColor={Colors.BLACK}
          returnKeyType="next"
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={45}
          onChangeText={email => this.setState({ email })}
          onClear={() => this.setState({ email: '' })}
          label={I18n.t('passcode_recovery.backup_email')}
          showIcon={email ? true : false}
        />
        <ButtonBottom
          offset={offset}
          disabled={!validateEmail(email) && !validatePhoneNumber(phone)}
          onPress={() => this.onSubmit()}
          title="Xác nhận"
        />
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 54,
    backgroundColor: Colors.WHITE
  }
});

export default connect()(PasscodeRecoverySetup);
