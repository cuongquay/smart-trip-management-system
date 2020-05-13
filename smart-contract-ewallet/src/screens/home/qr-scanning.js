/**
 * @flow
 */

'use strict';

import React, { Component } from 'react';
import {
  Dimensions,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  Image,
  Platform,
  Linking,
  Alert,
  AppState
} from 'react-native';
import { connect } from 'react-redux';
import { I18n } from 'common';
import { Colors, Text } from 'common/ui';
import { Icon } from 'react-native-elements';
import Camera from 'react-native-camera';
import Permissions from 'react-native-permissions';
import { Header } from 'common/ui/header';
import Url from 'url';
import { parse } from 'querystring';

const { width, height } = Dimensions.get('window');
const INTERVAL = 3000;

class QRScanning extends Component {
  static navigationOptions = () => {
    return {
      header: null
    };
  };

  constructor(props) {
    super(props);
    this.processing = false;
    this.state = {
      show: false,
      flashOn: false,
      isInvalid: false
    };
  }

  componentDidMount() {
    this.init();
    AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        this.init();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { routes } = nextProps.navState;
    if (routes[routes.length - 1].routeName === 'QRScreen') {
      this.setState({ show: true });
    } else {
      this.setState({ show: false });
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change');
  }

  init() {
    if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) < 9) {
      return Permissions.check('camera').then(response => {
        console.log(response);
        if (response === 'authorized') {
          return this.setState({ show: true });
        }
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        if (response === 'undetermined') {
          // If it is undetermined.
          return Permissions.request('camera').then(resp => {
            console.log(resp);
            if (resp === 'authorized') {
              this.setState({ show: true });
            } else {
              return;
            }
          });
        }

        if (response === 'restricted' || response === 'denied') {
          this.showCameraRequest();
        }
      });
    }
    setTimeout(() => {
      // iOS 9 and above:
      this.setState({ show: true });
    }, 2000);
  }

  showCameraRequest() {
    Alert.alert(
      I18n.t('qr_scanning.dialog_camera_request.title'),
      I18n.t('qr_scanning.dialog_camera_request.message'),
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => Linking.openURL('app-settings:')
        }
      ],
      { cancelable: false }
    );
  }

  barcodeReceived(e) {
    this.processData(e.data);
  }

  processData() {
    if (!paymentActivity) {
      this.setState({ isInvalid: true });
      this.onShowAlert();
      return;
    }
  }

  switchFlashMode() {
    return this.setState({ flashOn: !this.state.flashOn });
  }

  goBack = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  goBackWithMerchantInfo(merchantInfo) {
    const { navigation } = this.props;
    navigation.state.params.navigationData(merchantInfo);
    navigation.goBack();
  }

  goBackWithTransferPhone(phone) {
    const { navigation } = this.props;
    navigation.state.params.transferPhoneData(phone);
    navigation.goBack();
  }

  getQueryVariable(url) {
    const query = Url.parse(url).query;
    return parse(query);
  }

  onShowAlert() {
    const { isInvalid } = this.state;
    if (!isInvalid) return;
    setTimeout(() => {
      this.setState({ isInvalid: false });
    }, INTERVAL);
  }

  renderBarcode() {
    const { width, height } = Dimensions.get('window');
    const { show, flashOn } = this.state;

    return (
      show && (
        <Camera
          style={{ flex: 1, width, height }}
          ref={component => (this.camera = component)}
          aspect={Camera.constants.Aspect.fill}
          orientation={Camera.constants.Orientation.portrait}
          barcodeFinderWidth={Dimensions.get('window').width}
          barcodeFinderHeight={Dimensions.get('window').width}
          torchMode={
            flashOn
              ? Camera.constants.TorchMode.on
              : Camera.constants.TorchMode.off
          }
          onBarCodeRead={e => this.barcodeReceived(e)}
        />
      )
    );
  }

  render() {
    const { flashOn, isInvalid } = this.state;

    return (
      <View style={[styles.container, {}]}>
        <StatusBar barStyle={'light-content'} backgroundColor={'black'} />
        <Header
          style={{ position: 'absolute', width, zIndex: 4, marginTop: 30 }}
          headerLeft={
            <TouchableOpacity onPress={this.goBack}>
              <View style={styles.headerLeft}>
                <Icon
                  style={styles.headerLeftIcon}
                  name={'ios-arrow-back'}
                  color={Colors.WHITE}
                  type={'ionicon'}
                />
                <Text style={styles.headerLeftText}>
                  {I18n.t('qr_scanning.back')}
                </Text>
              </View>
            </TouchableOpacity>
          }
          headerRight={
            <TouchableOpacity onPress={() => this.switchFlashMode()}>
              <View style={styles.headerRight}>
                <Icon
                  style={styles.headerLeftIcon}
                  name={'ios-flash'}
                  color={Colors.WHITE}
                  type={'ionicon'}
                />
                <Text style={styles.headerRightText}>
                  {flashOn
                    ? I18n.t('qr_scanning.turn_off_flash')
                    : I18n.t('qr_scanning.turn_on_flash')}
                </Text>
              </View>
            </TouchableOpacity>
          }
        />
        <Text semiBold style={styles.reminder}>
          {I18n.t('qr_scanning.title')}
        </Text>

        {this.renderBarcode()}

        <Image
          style={styles.focusFrame}
          resizeMode={'cover'}
          source={
            isInvalid
              ? require('assets/qr_backdrop_alert.png')
              : require('assets/qr_backdrop.png')
          }
        />

        {isInvalid && (
          <Text style={styles.phone}>{I18n.t('qr_scanning.error')}</Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.BLACK
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  headerLeftIcon: {
    backgroundColor: 'transparent',
    color: Colors.WHITE
  },
  headerLeftText: {
    color: Colors.WHITE,
    backgroundColor: 'transparent',
    marginLeft: 10,
    marginBottom: 3,
    fontSize: 16
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.WHITE,
    marginRight: 10
  },
  headerRightText: {
    color: Colors.WHITE,
    backgroundColor: 'transparent',
    marginLeft: 4,
    marginBottom: 3
  },
  phone: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    bottom: 80,
    color: Colors.RED_PRIMARY,
    textAlign: 'center',
    width: width * 0.7,
    zIndex: 4
  },
  reminder: {
    position: 'absolute',
    top: height * 1 / 5 - 12,
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: 17,
    color: 'white',
    zIndex: 4
  },
  focusFrame: {
    width: width,
    height: height,
    zIndex: 3,
    position: 'absolute'
  }
});

const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });
export default connect(mapStateToProps, mapDispatchToProps)(QRScanning);
