import React, { Component } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { I18n, setLoadingView, ToastManager } from 'common';
import {
  CountdownText,
  Colors,
  MaskedCode,
  Text,
  VirtualKeyboard,
  VirtualKeyboardTypes
} from 'common/ui';
import { ButtonBack, ButtonBlank } from 'common/ui/header';
import { phoneNumberFormat, validateEmail } from 'utilities';
import { apiPasscode } from 'apis/api-passcode';
import { reset } from 'actions/actions-navigation';
import _styles from './_styles';

export default class PasscodeLock extends Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;

    return {
      headerLeft: <ButtonBack onPress={() => goBack()} />,
      headerRight: <ButtonBlank />
    };
  };

  constructor(props) {
    super(props);
    this.retryLeft = 3;
    this.state = {
      showCounter: true,
      code: ''
    };
  }

  onResponderRelease = () => {
    if (this.state.code) {
      const { title, message } = I18n.t('errors.PasscodeEmpty');
      ToastManager.show(title, message);
    }
  };

  onUpdateCode(keys, code /*eslint-disable-line no-unused-vars*/) {
    this.setState({ code: keys });
  }

  resetCode() {
    this.setState({ code: '' });
  }

  onReachedZero() {
    this.setState({ showCounter: false });
  }

  async onResend() {
    const { navigation } = this.props;
    const { params } = navigation.state;

    try {
      setLoadingView(true);
      const resp = await apiPasscode.resetPasscodeRequest(
        params.reset_address,
        params.phone_number
      );
      setLoadingView(false);
      console.log(resp);
      if (!resp.code) {
        this.setState({ showCounter: true });
      }
    } catch (e) {
      console.log(e);
      setLoadingView(false);
    }
  }

  onSubmit() {
    if (this.state.code.length === 6) {
      const { navigation } = this.props;
      const { request_id, phone_number } = navigation.state.params;
      apiPasscode
        .resetPasscodeVerify(request_id, this.state.code)
        .then(resp => {
          console.log(resp);
          // resp is only true or false. true = passcode resetted.
          if (resp) {
            const data = {
              request_id,
              phone_number
            };
            navigation.dispatch(reset(['PasscodeSetupScreen'], data));
          } else {
            // Request invalid.
            this.resetCode();
            if (this.retryLeft === 1) {
              const { title, message } = I18n.t(
                'passcode_lock.wrong_verification_code_exceeded'
              );
              ToastManager.show(title, message);
              // Quay lại màn nhập mã khoá.
              navigation.pop(2);
            }
            this.retryLeft--;

            const title = I18n.t(
              'passcode_lock.wrong_verification_code.title',
              { count: this.retryLeft }
            );
            const message = I18n.t(
              'passcode_lock.wrong_verification_code.message',
              { count: this.retryLeft }
            );
            ToastManager.show(title, message);
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  render() {
    const { code, showCounter } = this.state;
    const { navigation } = this.props;
    const { reset_address } = navigation.state.params;

    return (
      <ScrollView
        contentContainerStyle={_styles.container}
        onResponderRelease={this.onResponderRelease}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            alignItems: 'center'
          }}
        >
          <Text style={styles.subtitle}>
            {I18n.t('passcode_recovery.code_confirm_title')}
          </Text>
          <Text style={[styles.address]}>
            {validateEmail(navigation.state.params.reset_address)
              ? reset_address
              : phoneNumberFormat(reset_address)}
          </Text>
          <MaskedCode dashed onFull={() => this.onSubmit()} value={code} />{' '}
          {showCounter ? (
            <CountdownText
              style={styles.countdown}
              stringTemplate="confirmation.code_receive_after"
              onReachedZero={() => this.onReachedZero()}
            />
          ) : (
            <Text
              semiBold
              onPress={() => this.onResend()}
              style={styles.countdownReplacement}
            >{`Gửi lại mã`}</Text>
          )}
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
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: 12,
    marginBottom: 7,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: Colors.BLACK
  },
  countdown: {
    marginTop: 18,
    fontSize: 16,
    color: Colors.BLACK
  },
  countdownReplacement: {
    color: Colors.BLACK,
    fontSize: 16,
    marginTop: 18
  },
  address: {
    fontWeight: 'bold',
    marginBottom: 48,
    fontSize: 18
  }
});
