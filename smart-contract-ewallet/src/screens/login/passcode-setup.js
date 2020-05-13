import React, { Component } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { setLoadingView, I18n, ToastManager } from 'common';
import { connect } from 'react-redux';
import {
  Colors,
  MaskedCode,
  VirtualKeyboard,
  VirtualKeyboardTypes,
  Text
} from 'common/ui';

import { apiPasscode } from 'apis/api-passcode';
import { apiAuthenticate } from 'apis/api-authenticate';
import { saveUserData } from 'actions/actions-user';
import { setToken } from 'apis';

import { ButtonBack, ButtonBlank } from 'common/ui/header';
import { getExceptionMessage, getCachedDeviceInfo } from 'utilities';
import { reset } from 'actions/actions-navigation';
import _styles from './_styles';

class PasscodeSetup extends Component {
  static navigationOptions = ({ navigation }) => {
    console.log(navigation);
    const { goBack } = navigation;
    const { params } = navigation.state;

    return {
      headerLeft: params.code ? (
        <ButtonBack onPress={() => goBack()} color={Colors.WHITE} />
      ) : (
        <ButtonBlank />
      ),
      headerRight: <ButtonBlank />
    };
  };

  constructor(props) {
    super(props);
    // State, for displaying.
    this.state = {
      code: ''
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    console.log(navigation.state.params);
    this.sub = navigation.addListener('didFocus', () => this.resetCode());
  }

  componentWillUnmount() {
    this.sub && this.sub.remove();
  }

  onResponderRelease = () => {
    if (this.state.code) {
      const { title, message } = I18n.t('errors.PasscodeEmpty');
      ToastManager.show(title, message);
    }
  };

  onUpdateCode(keys, code /*eslint-disable-line no-unused-vars*/) {
    this.setState(
      {
        code: keys
      },
      () => {
        if (this.state.code.length === 6) {
          this.onSubmit();
        }
      }
    );
  }

  resetCode() {
    this.setState({ code: '' });
  }

  onSubmit() {
    const { navigation } = this.props;
    const { request_id, phone_number, code, user } = navigation.state.params;
    // Người dùng đang ở chế độ khôi phục passcode
    if (this.state.code.length === 6 && request_id) {
      console.log(this.state.code);
      console.log(request_id);
      const { navigation } = this.props;
      console.log(navigation.state.params);
      if (!code) {
        console.log('Test');
        // Entered code for the 1st time:
        navigation.push('PasscodeSetupScreen', {
          ...navigation.state.params,
          code: this.state.code
        });
      } else {
        // Entered code for the 2nd time:
        if (this.state.code === code) {
          // Correct code.
          apiPasscode
            .resetPasscode(request_id, this.state.code)
            .then(resp => {
              console.log(resp);
              // resp is only true or false. true = passcode resetted.
              if (resp) {
                this.loginWithNewPasscode();
              } else {
                console.log('Wrong Passcode');
              }
              console.log(navigation.state.params);
            })
            .catch(e => {
              console.log(e);
            });
        } else {
          // Sai code, hiện toast lên.
          const { title, message } = getExceptionMessage(
            'InputCodesDoNotMatch'
          );
          ToastManager.show(title, message);
          this.resetCode();
        }
      }
    } else {
      console.log('Inputed Code ' + this.state.code);
      // Người dùng mới, đang lần đầu cài passcode. 'user' is not null --> It is used
      // to cache for the next request.
      if (!code) {
        console.log('Test');
        // Người dùng nhập code lần đầu, sang màn y hệt tiếp theo để nhập lần 2.
        navigation.push('PasscodeSetupScreen', {
          phone_number,
          code: this.state.code,
          user
        });
      } else {
        // Người dùng đã nhập passcode đúng 2 lần, sang màn đặt địa chỉ khôi phục.
        if (code === this.state.code) {
          navigation.push('PasscodeRecoverySetupScreen', {
            phone_number,
            code,
            user
          });
        } else {
          // Người dùng nhập sai passcode ở lần confirm, reset ô nhập và hiện toast:
          const { title, message } = getExceptionMessage(
            'InputCodesDoNotMatch'
          );
          ToastManager.show(title, message);
          this.resetCode();
        }
      }
    }
  }

  /**
   * Only occurs when a new passcode is set.
   */
  async loginWithNewPasscode() {
    const { dispatch, navigation } = this.props;
    const { params } = this.props.navigation.state;
    setLoadingView(true);
    try {
      const resp = await apiAuthenticate.loginRequest({
        phone_number: params.phone_number,
        device_info: getCachedDeviceInfo()
      });
      console.log(resp);
      // Requested, now login.
      if (resp.request_id) {
        const data = {
          customer_id: resp.customer_id,
          request_id: resp.request_id,
          verify_mode: resp.verify_mode,
          access_code: this.state.code,
          login_log_id: resp.login_log_id
        };

        const loginResp = await apiAuthenticate.loginVerify(data);
        if (loginResp.customer) {
          setToken(loginResp.token);
          dispatch(saveUserData(loginResp));
          navigation.dispatch(reset(['HomeScreen']));
        }
      }

      setLoadingView(false);
    } catch (e) {
      setLoadingView(false);
    }
  }

  render() {
    const { code } = this.state;
    const { navigation } = this.props;

    return (
      <ScrollView
        contentContainerStyle={_styles.container}
        onResponderRelease={this.onResponderRelease}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.group}>
          <Text style={styles.subtitle}>
            {I18n.t(
              navigation.state.params.code
                ? 'passcode_code.title_repeat'
                : 'passcode_code.title'
            )}
          </Text>
          <MaskedCode value={code} />
        </View>

        <VirtualKeyboard
          validateData={() => {
            return this.state.code.length >= 6;
          }}
          clearState={this.state.code === '' ? true : false}
          onPress={(keys, code) => this.onUpdateCode(keys, code)}
          keyboardType={VirtualKeyboardTypes.FLASH_NUMERIC}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  group: {
    alignItems: 'center'
  },
  subtitle: {
    marginVertical: 16,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: Colors.BLACK
  }
});

export default connect()(PasscodeSetup);
