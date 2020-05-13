import React, {Component} from 'react';
import {
  View,
  Text,
  Platform,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
let {width} = Dimensions.get('window');
import {I18n, ToastManager} from 'common';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ButtonBack, ButtonBlank} from 'common/ui/header';
import {MaterialInput, Colors} from 'common/ui';
import {setLoading} from 'actions/actions-common';
import {updateUserData} from 'actions/actions-user';
import {getExceptionMessage, validateEmail, validatePhoneNumber} from 'utilities';
import {apiProfile} from 'apis/api-profile';

export default class RestorePassWord extends Component {
  static navigationOptions = ({navigation}) => {
    const {goBack} = navigation;
    return {
      title: I18n.t('setting.password_recovery_info'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK}/>,
      headerRight: <ButtonBlank/>,
      headerTitleStyle: {
        width: width * 0.9,
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 19
      }
    };
  };

  constructor(props) {
    super(props);
    const {user} = props.navigation.state.params;
    console.log(user);
    this.state = {
      phoneText: user.reset_phone
        ? user.reset_phone
        : '',
      emailText: user.reset_email
        ? user.reset_email
        : ''
    };
  }

  changePhone(value) {
    this.setState({phoneText: value});
  }
  changeEmail(value) {
    this.setState({emailText: value});
  }

  checkEmail = () => {
    if (this.state.emailText) {
      if (!validateEmail(this.state.emailText.trim())) {
        const {title, message} = getExceptionMessage('InvalidResetEmail');
        ToastManager.show(title, message);
        return false;
      }
      return true;
    }
    return true;
  };
  checkPhoneNumber = () => {
    if (this.state.phoneText) {
      if (!validatePhoneNumber(this.state.phoneText.trim())) {
        const {title, message} = getExceptionMessage('InvalidResetPhone');
        ToastManager.show(title, message);
        return false;
      }
      return true;
    }
    return true;
  };

  update() {
    const {navigation} = this.props;
    const {user, dispatch} = navigation.state.params;
    const {phoneText, emailText} = this.state;
    let data = {};
    if (!this.checkEmail() || !this.checkPhoneNumber()) {
      return;
    }
    if ((!phoneText && emailText && this.checkEmail()) || (!emailText && phoneText && this.checkPhoneNumber()) || (this.checkEmail() && this.checkPhoneNumber() && phoneText && emailText)) {
      data = {
        reset_phone: phoneText,
        reset_email: emailText
      };
    } else if (!phoneText && !emailText) {
      const {title, message} = I18n.t('errors.BackupAddressNotEntered');
      ToastManager.show(title, message);
      return;
    }
    let userData = {
      customer: user,
      expired_at: user.expired_at,
      token: user.token
    };
    console.log(userData);
    dispatch(setLoading(true));
    apiProfile
      .update(user.id, data.avatar_img, data.full_name, data.reset_email, data.reset_phone)
      .then(result => {
        console.log(result);
        if (result.code) {
          dispatch(setLoading(false));
          const {title, message} = getExceptionMessage(result.code);
          ToastManager.show(title, message);
          return;
        }
        userData.customer.reset_email = result.reset_email;
        userData.customer.reset_phone = result.reset_phone;
        delete userData.customer.expired_at;
        delete userData.customer.token;
        dispatch(updateUserData(userData));
        dispatch(setLoading(false));
        navigation.goBack();
      })
      .catch(e => {
        console.log(e);
        dispatch(setLoading(false));
      });
  }
  render() {
    const {phoneText, emailText} = this.state;

    return (
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <ScrollView
          contentContainerStyle={{
          alignItems: 'center',
          width: width
        }}>
          <View style={styles.containerHeader}>
            <View style={styles.containerBody}>
              <Text style={styles.title}>
                {I18n.t('setting.enter_phone_number_or_email')}
              </Text>
              <Text
                style={{
                color: 'rgb(74,173,205)',
                fontSize: 15,
                marginTop: 10,
                alignSelf: 'flex-start'
              }}>
                {I18n.t('setting.back_up_phone_number')}
              </Text>
              <MaterialInput
                keyboardType={'numeric'}
                maxLength={11}
                value={phoneText}
                placeholder={'000 000 000'}
                onChangeText={e => {
                this.changePhone(e);
              }}
                onClear={() => {
                this.changePhone('');
              }}
                showIcon
                fontSize={18}/>
              <MaterialInput
                maxLength={45}
                placeholderTextColor={'rgb(47, 54, 66)'}
                placeholder={I18n.t('setting.back_up_email')}
                value={emailText}
                onChangeText={e => {
                this.changeEmail(e);
              }}
                onClear={() => {
                this.changeEmail('');
              }}
                showIcon
                fontSize={18}/>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.buttonUpdate}
          onPress={() => {
          this.update();
        }}>
          <Text style={styles.styleTextContinue}>
            {I18n.t('common.update')}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios'
      ? 20
      : 0
  },
  containerHeader: {
    width: width * 0.92,
    justifyContent: 'center',
    backgroundColor: Colors.WHITE
  },
  containerBody: {
    marginTop: 20,
    paddingBottom: 15,
    alignItems: 'center'
  },
  title: {
    color: 'rgb(47,54,66)',
    fontSize: 16,
    marginBottom: 10
  },
  buttonUpdate: {
    backgroundColor: 'rgb(75,173,205)',
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    //position:'absolute',
    height: 55
  },
  styleTextContinue: {
    fontSize: 16,
    color: Colors.WHITE,
    fontWeight: 'bold'
  }
});
