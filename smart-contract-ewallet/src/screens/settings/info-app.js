import React, {Component} from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  Linking,
  Platform,
  TouchableOpacity
} from 'react-native';
let {width} = Dimensions.get('window');
import {I18n, SettingBrowseUrl} from 'common';
import {ButtonBack, ButtonNext, ButtonBlank} from 'common/ui/header';
import {Colors} from 'common/ui';

const HeaderBody = () => {
  return (
    <View
      style={{
      flexDirection: 'row',
      justifyContent: 'flex-start'
    }}>
      <Image
        style={{
        width: 64,
        height: 64,
        alignSelf: 'flex-start'
      }}
        resizeMode="contain"
        source={require('assets/home/app-logo.png')}/>
      <View style={{
        marginLeft: 10,
        width: width - 64
      }}>
        <Text
          style={[
          styles.title, {
            fontWeight: '500'
          }
        ]}>
          {I18n.t('app_info.ononpay_app')}
        </Text>
        <Text
          style={[
          styles.title, {
            fontSize: 15
          }
        ]}>
          {I18n.t('app_info.version')}
          2.1.0 Build 2812
        </Text>
        <Text style={styles.textInfo}>{I18n.t('app_info.development_by')}</Text>
      </View>
    </View>
  );
};

const FormView = ({title, style, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.containerForm, style]}>
      <Text style={{
        color: 'rgb(47,54,66)',
        fontSize: 17
      }}>{title}</Text>
      <ButtonNext onPress={onPress}/>
    </TouchableOpacity>
  );
};

export default class InfoApp extends Component {
  static navigationOptions = ({navigation}) => {
    const {goBack} = navigation;
    return {
      title: I18n.t('setting.app_info'),
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
  }

  openUrl(url) {
    Linking
      .canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Don't know how to open URI: " + url);
        }
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={{
          alignItems: 'center',
          width: width
        }}>
          <View style={styles.containerHeader}>
            <HeaderBody/>
            <FormView
              title={I18n.t('app_info.vote_for_ononpay')}
              onPress={() => {
              let url = Platform.OS === 'ios'
                ? SettingBrowseUrl.voted.IOSUrl
                : SettingBrowseUrl.voted.AndroidUrl;
              this.openUrl(url);
            }}/>
            <FormView
              title={I18n.t('app_info.ononpay_on_fb')}
              onPress={() => {
              this.openUrl(SettingBrowseUrl.facebook.url);
            }}/>
            <FormView
              title={I18n.t('app_info.ononpay_website')}
              onPress={() => {
              this.openUrl(SettingBrowseUrl.website.url);
            }}/>
            <FormView
              title={I18n.t('app_info.termsof_use')}
              style={{
              borderBottomWidth: 0
            }}
              onPress={() => {
              this.openUrl(SettingBrowseUrl.rules.url);
            }}/>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  containerHeader: {
    width: width * 0.92,
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    marginTop: 15,
    paddingBottom: 15
  },
  title: {
    color: 'rgb(47,54,66)',
    fontSize: 17,
    marginBottom: 4
  },
  textInfo: {
    color: 'rgb(137,139,141)',
    width: width - 90,
    fontSize: 15
  },
  containerForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: 'rgb(223,223,223)',
    borderBottomWidth: 1,
    paddingBottom: 15,
    paddingTop: 15,
    alignItems: 'center'
  }
});
