import React, { Component } from 'react';
import { StatusBar, Image, StyleSheet, View } from 'react-native';
import {
  I18n,
  getCachedDeviceInfo,
  ToastManager,
  setLoadingView
} from 'common';
import { Text, Colors } from 'common/ui';

import { apiAuthenticate } from 'apis/api-authenticate';
import { getExceptionMessage } from 'utilities';
import { Header, Button, ButtonFlag, ButtonBlank } from 'common/ui/header';

import { connect } from 'react-redux';
import { reset } from 'actions/actions-navigation';
import _styles from './_styles';

class PasscodeWelcomeBack extends Component {
  static navigationOptions = () => {
    return { header: null };
  };

  constructor(props) {
    super(props);
    this.code = [];
  }

  async onSubmit() {
    const { navigation, user } = this.props;
    try {
      setLoadingView(true, true);
      const resp = await apiAuthenticate.loginRequest({
        phone_number: user.phone_number,
        device_info: getCachedDeviceInfo()
      });
      console.log(resp);
      setLoadingView(false, true);
      if (!resp.code) {
        navigation.navigate('PasscodeConfirmationScreen', {
          transition: 'fromRight',
          ...resp,
          phone_number: user.phone_number
        });
      } else if (resp.code === 'MultipleLoginException') {
        const { title, message } = getExceptionMessage(resp.code);
        ToastManager.show(title, message);
      } else {
        navigation.navigate('AccountLockedScreen', 'passcode');
      }
    } catch (e) {
      setLoadingView(false, true);
      console.log(e);
    }
  }

  render() {
    const { navigation, config, user } = this.props;

    return (
      <View style={styles.container}>
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

        <Image
          source={
            user.avatar_img
              ? {
                  uri: user.avatar_img
                }
              : require('assets/home/avatar_default.png')
          }
          resizeMode="cover"
          style={styles.avatar}
        />

        <Text semiBold style={styles.greeting}>
          {I18n.t('auth_backtrack.greeting', { name: user.full_name })}
        </Text>

        <Button
          title={I18n.t('auth_backtrack.start')}
          onPress={() => this.onSubmit()}
        />
        <Text
          semiBold
          style={styles.relogText}
          onPress={() => navigation.dispatch(reset(['PasscodeScreen']))}
        >
          {I18n.t('auth_backtrack.another_number')}
        </Text>
      </View>
    );
  }
}

const AVATAR_SIZE = 74;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingBottom: 12,
    paddingTop: 24
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2
  },
  greeting: {
    textAlign: 'center',
    fontSize: 19,
    color: Colors.BLACK,
    lineHeight: 28
  },
  relogText: {
    color: Colors.BLACK,
    marginTop: 56,
    fontSize: 19
  }
});

const mapStateToProps = ({ user, config, navState }) => ({
  user,
  config,
  navState
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(
  PasscodeWelcomeBack
);
