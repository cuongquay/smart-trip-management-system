import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  DeviceEventEmitter
} from 'react-native';
import { connect } from 'react-redux';
import { I18n } from 'common';
import { Colors, Text } from 'common/ui';
import { ButtonBack, ButtonBlank, ButtonNext } from 'common/ui/header';
let { width } = Dimensions.get('window');
import { apiSetting } from 'apis/api-setting';
import { setLoading } from 'actions/actions-common';
import { currencyFormat } from 'utilities';

class SettingApplication extends Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;
    return {
      title: I18n.t('setting.title'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK} />,
      headerRight: <ButtonBlank />,
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
    this.state = {
      login_locked: false,
      otp_amount_enable: '500000',
      language: this.props.config.language
    };
    this.getSetting('login_locked');
    this.getSetting('otp_amount_enable');
  }

  componentWillMount() {
    DeviceEventEmitter.addListener('UPDATE_SETTING_AMOUNT_LIMIT', () => {
      this.getSetting('otp_amount_enable');
    });
    DeviceEventEmitter.addListener('UPDATE_LANGUAGE', e => {
      this.setState({ language: e });
    });
  }

  onPress = (screen, params) => {
    const { dispatch, user, navigation } = this.props;
    navigation.navigate(screen, {
      dispatch: dispatch,
      user: user,
      params: params
    });
  };

  getSetting(field_name) {
    const { user, dispatch } = this.props;
    dispatch(setLoading(true));
    apiSetting
      .getCustomerSettings(user.id, field_name)
      .then(result => {
        console.log(result);
        if (!result.code) {
          let { settings } = result;
          // console.log(settings);
          // console.log(settings.login_locked.length);
          if (
            settings.login_locked !== undefined &&
            settings.login_locked.length !== 0
          ) {
            this.setState({ login_locked: settings.login_locked });
          }
          if (
            settings.otp_amount_enable &&
            settings.otp_amount_enable.length !== 0
          ) {
            this.setState({
              otp_amount_enable: settings.otp_amount_enable
            });
          } else {
            this.setState({
              otp_amount_enable: null
            });
          }
        }
        dispatch(setLoading(false));
      })
      .catch(err => {
        dispatch(setLoading(false));
        console.log(err);
      });
  }
  updateLoginLock() {
    const { navigation } = this.props;
    const { dispatch } = this.props;
    dispatch(setLoading(true));
    const { user } = navigation.state.params;
    apiSetting
      .setCustomerSettings(user.id, { login_locked: !this.state.login_locked })
      .then(result => {
        console.log(result);
        if (!result.code) {
          this.setState({ login_locked: result.login_locked });
          dispatch(setLoading(false));
        }
      })
      .catch(err => {
        console.log(err);
        dispatch(setLoading(false));
      });
  }

  render() {
    const { otp_amount_enable, login_locked } = this.state;
    const { navigation } = this.props;

    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
        <View style={{ flex: 1, alignItems: 'center', width: width }}>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.containerPricePay}
              onPress={() => {
                this.onPress('ChangeLimitPriceScreen', otp_amount_enable);
              }}
            >
              <View style={styles.pricePay}>
                <Text
                  ellipsizeMode={'tail'}
                  style={[styles.textPrice, { color: 'rgb(47,54,66)' }]}
                >
                  {I18n.t('setting.payment_limit')}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Text style={styles.textPrice}>
                    {otp_amount_enable
                      ? currencyFormat(otp_amount_enable) + 'đ'
                      : I18n.t('setting.unlimited')}
                  </Text>
                  <ButtonNext
                    onPress={() => {
                      this.onPress('ChangeLimitPriceScreen', otp_amount_enable);
                    }}
                  />
                </View>
              </View>
              <Text style={{ color: 'rgb(80,95,121)' }}>
                {I18n.t('setting.not_accuracy_OTP')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.containerPricePay}>
              <View style={styles.pricePay}>
                <Text
                  ellipsizeMode={'tail'}
                  style={[styles.textPrice, { color: 'rgb(47,54,66)' }]}
                >
                  {I18n.t('setting.fingerprint_authentication')}
                </Text>
                <Switch disabled />
              </View>
              <Text style={{ color: 'rgb(80,95,121)' }}>
                {I18n.t('setting.note')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('PasscodeChangeScreen')}
              style={styles.containerSettingLogin}
            >
              <Text
                ellipsizeMode={'tail'}
                style={[styles.textPrice, { color: 'rgb(47,54,66)' }]}
              >
                {I18n.t('setting.change_passcode')}
              </Text>
              <ButtonNext />
            </TouchableOpacity>
            <TouchableOpacity style={styles.containerSettingLogin}>
              <Text
                ellipsizeMode={'tail'}
                style={[styles.textPrice, { color: 'rgb(47,54,66)' }]}
              >
                {I18n.t('setting.login_only_this_service')}
              </Text>
              <Switch
                value={login_locked}
                onTintColor={Colors.BLACK}
                thumbTintColor={
                  Platform.OS === 'android'
                    ? !login_locked
                      ? null
                      : Colors.BLACK
                    : null
                }
                tintColor={Colors.BLACK}
                onValueChange={() => this.updateLoginLock()}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.onPress('ChangeLanguageScreen');
              }}
              style={styles.containerSettingLogin}
            >
              <Text style={[styles.textPrice, { color: 'rgb(47,54,66)' }]}>
                {I18n.t('setting.change_language')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Image
                  style={{ width: 28, height: 20, marginLeft: 7 }}
                  source={
                    this.state.language === 'vi'
                      ? require('assets/flags/vi.png')
                      : require('assets/flags/en.png')
                  }
                />
                <ButtonNext
                  style={{ paddingLeft: 10 }}
                  onPress={() => {
                    this.onPress('ChangeLanguageScreen');
                  }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.onPress('RestorePassWordScreen');
              }}
              style={styles.containerSettingLogin}
            >
              <Text
                ellipsizeMode={'tail'}
                style={[styles.textPrice, { color: 'rgb(47,54,66)' }]}
              >
                {I18n.t('setting.password_recovery_info')}
              </Text>
              <ButtonNext
                onPress={() => {
                  this.onPress('RestorePassWordScreen');
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.onPress('InfoAppScreen');
              }}
              style={[styles.containerSettingLogin]}
            >
              <Text style={[styles.textPrice, { color: 'rgb(47,54,66)' }]}>
                {I18n.t('setting.app_info')}
              </Text>
              <ButtonNext
                onPress={() => {
                  this.onPress('InfoAppScreen');
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.92,
    justifyContent: 'center'
  },
  containerPricePay: {
    marginTop: 20,
    borderColor: 'rgb(223,223,223)',
    borderBottomWidth: 1,
    paddingBottom: 15
  },
  pricePay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
    alignItems: 'center'
  },
  textPrice: {
    color: 'rgb(74,173,205)',
    fontSize: 16,
    fontWeight: '500'
  },
  containerSettingLogin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: 'rgb(223,223,223)',
    borderBottomWidth: 1,
    paddingBottom: 15,
    paddingTop: 15,
    alignItems: 'center'
  }
});

const mapStateToProps = ({ user, navState, config }) => ({
  user,
  navState,
  config
});
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(SettingApplication);
