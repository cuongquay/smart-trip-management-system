import React, { Component } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { setLoadingView, I18n, ToastManager } from 'common';
import { connect } from 'react-redux';
import { apiPasscode } from 'apis/api-passcode';
import {
  Colors,
  Text,
  MaskedCode,
  VirtualKeyboard,
  VirtualKeyboardTypes
} from 'common/ui';
import { ButtonBack, ButtonBlank } from 'common/ui/header';
import { getExceptionMessage } from 'utilities';
import _styles from './_styles';

class PasscodeChange extends Component {
  static navigationOptions = ({ navigation }) => {
    console.log(navigation);
    const { goBack } = navigation;

    return {
      title: I18n.t('change_passcode.title'),
      headerLeft: <ButtonBack onPress={() => goBack()} />,
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

  onUpdateCode(keys) {
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
    const { params } = navigation.state;
    const { code } = this.state;
    if (!params) {
      // Mới nhập xong code cũ, sang nhập code mới.
      return navigation.push('PasscodeChangeScreen', { currentCode: code });
    } else if (params && !params.repeated) {
      // Đã nhập code cũ, nhập code mới lần 1.
      return navigation.push('PasscodeChangeScreen', {
        currentCode: params.currentCode,
        newCode: code,
        repeated: true
      });
    } else {
      if (code !== params.newCode) {
        navigation.goBack();
        const { title, message } = I18n.t('errors.InputCodesDoNotMatch');
        return ToastManager.show(title, message, 'error');
      }
      setLoadingView(true);
      console.log('Old code: ' + params.currentCode);
      console.log('New code: ' + params.newCode);
      return apiPasscode
        .changePasscode(params.currentCode, params.newCode)
        .then(resp => {
          setLoadingView(false);
          console.log(resp);
          if (resp.code) {
            const { title, message } = getExceptionMessage(resp.code);
            ToastManager.show(title, message);
            if (resp.code === 'NewPasscodeSameOldPasswordException') {
              // Pass mới trùng pass cũ.
              navigation.goBack();
            } else if (resp.code === 'CurrentPasscodeInvalidException') {
              // Pass cũ nhập sai.
              navigation.pop(2);
            } else {
              // Các trường hợp còn lại.
              navigation.goBack();
            }
          } else {
            // Đổi mã thành công.
            const { title, message } = I18n.t(
              'change_passcode.passcode_changing_success'
            );
            ToastManager.show(title, message);
            navigation.pop(3);
          }
        })
        .catch(e => {
          setLoadingView(false);
          console.log(e);
        });
    }
  }

  render() {
    const { code } = this.state;
    const { navigation } = this.props;
    const { params } = navigation.state;

    return (
      <ScrollView
        contentContainerStyle={_styles.container}
        onResponderRelease={this.onResponderRelease}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.group}>
          <Text style={styles.subtitle}>
            {I18n.t(
              params && params.repeated
                ? 'change_passcode.enter_new_passcode_repeat'
                : params
                  ? 'change_passcode.enter_new_passcode'
                  : 'change_passcode.enter_current_passcode'
            )}
          </Text>
          <MaskedCode value={code} />
        </View>

        <VirtualKeyboard
          validateData={() => {
            return code.length >= 6;
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

export default connect()(PasscodeChange);
