import React, { Component } from 'react';
import {
  StatusBar,
  View,
  Image,
  DeviceEventEmitter,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import {
  Colors,
  Text,
  TextInput,
  GradientLayout,
  VirtualKeyboard,
  VirtualKeyboardTypes
} from 'common/ui';
import { Events, ToastManager, I18n, setLoadingView } from 'common';
import {
  validatePhoneNumber,
  getCachedDeviceInfo,
  getExceptionMessage,
  getNetworkOperator
} from 'utilities';
import { Header, ButtonFlag, ButtonBlank } from 'common/ui/header';
import { connect } from 'react-redux';

import { apiAuthenticate } from 'apis/api-authenticate';
import _styles from './_styles';

class LoginScreen extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.phone = [];
    this.state = {
      phone: this.phone
    };
  }

  componentDidMount() {
    DeviceEventEmitter.addListener(Events.RELOAD_PHONE_NUMBER, () => {
      this.setState({ phone: '' });
    });
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener(Events.RELOAD_PHONE_NUMBER, () => {});
  }

  onKeyboardPressed(keys, code, validate) {
    this.setState({ phone: keys });
    return validate;
  }

  test() {
    if (!getNetworkOperator(this.state.phone)) {
      let { title, message } = I18n.t(
        'errors.IncorrectFormatPhoneNumberException'
      );
      ToastManager.show(title, message);
    }
  }

  async onSubmit() {
    const { navigation } = this.props;
    try {
      setLoadingView(true);
      const resp = await apiAuthenticate.loginRequest({
        phone_number: this.state.phone,
        device_info: getCachedDeviceInfo()
      });
      console.log(this.phone.join(''));
      console.log(resp);
      setLoadingView(false);
      if (!resp.code) {
        navigation.navigate('PasscodeConfirmationScreen', {
          transition: 'fromRight',
          ...resp,
          phone_number: this.state.phone
        });
      } else if (resp.code === 'MultipleLoginException') {
        const { title, message } = getExceptionMessage(resp.code);
        ToastManager.show(title, message);
      } else {
        navigation.navigate('AccountLockedScreen', 'passcode');
      }
    } catch (e) {
      setLoadingView(false);
      console.log(e);
    }
  }

  render() {
    const { navigation, config } = this.props;

    return (
      <GradientLayout style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header
          style={_styles.headerCustom}
          headerLeft={<ButtonBlank />}
          title={
            <Image
              style={_styles.logo}
              resizeMode={'contain'}
              source={require('assets/home/logo.png')}
            />
          }
          headerRight={
            <ButtonFlag
              onPress={() => navigation.navigate('ChangeLanguageScreen')}
              country={config.language}
            />
          }
        />

        <TouchableWithoutFeedback
          style={styles.mid}
          onPress={() => this.test()}
        >
          <View style={styles.mid_content}>
            <Text style={_styles.subtitle} regular>
              {I18n.t('auth.label_start')}
            </Text>
            <TextInput value={this.state.phone} textCenter activated />
          </View>
        </TouchableWithoutFeedback>

        <Text
          regular
          style={styles.tos}
          onPress={() => navigation.navigate('TOSScreen')}
        >
          {I18n.t('auth.tos')}
        </Text>

        <VirtualKeyboard
          validateData={() => {
            if (this.state.phone.length >= 10) {
              if (!validatePhoneNumber(this.state.phone)) {
                const { title, message } = I18n.t(
                  'errors.IncorrectFormatPhoneNumberException'
                );
                if (this.state.phone.indexOf('09') === 0) {
                  ToastManager.show(title, message);
                } else if (this.state.phone.length >= 11) {
                  ToastManager.show(title, message);
                }
              } else {
                return true;
              }
            }
            return false;
          }}
          keyboardType={VirtualKeyboardTypes.EXTENDED_PHONE}
          onDataValidated={keys => this.onSubmit(keys)}
          onPress={(keys, code, validate) =>
            this.onKeyboardPressed(keys, code, validate)
          }
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
    backgroundColor: Colors.BLACK,
    paddingBottom: 12,
    paddingTop: 24
  },
  mid: {
    alignItems: 'center',
    flex: 1
  },
  mid_content: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 50,
    flex: 1
  },
  tos: {
    fontSize: 17,
    color: Colors.BLACK,
    marginBottom: 16
  }
});

const mapStateToProps = ({ user, config, navState }) => ({
  user,
  config,
  navState
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
