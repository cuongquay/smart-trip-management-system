import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  AppState,
  Alert,
  Platform
} from 'react-native';
import MapView from 'react-native-maps';
import { I18n, ToastManager } from 'common';
import { Colors } from 'common/ui';
import * as _ from 'lodash';
import Polyline from '@mapbox/polyline';
import SystemSetting from 'react-native-system-setting';
import Permissions from 'react-native-permissions';
import { NearestMerchantCard } from 'maps/merchant-card';
import { apiMerchant, apiGeolocation, getDistance } from 'maps/apis';
import { getExceptionMessage } from 'utilities';

export default class MapPayment extends React.Component {
  constructor(props) {
    super(props);
    this.unmounted = false;
    this.debounced = _.debounce(this.startGettingLocation, 2000);
    this.state = {
      authorized: false,
      p1: {
        latlng: { latitude: 21.04356, longitude: 105.86923 }
      },
      p2: {
        latlng: { latitude: 0, longitude: 0 }
      },
      coords: [],
      merchants: [],
      distance: 0
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    // Request current location:
    if (Platform.OS === 'ios') {
      return Permissions.check('location').then(response => {
        console.log(response);
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        if (response === 'undetermined') {
          // If it is undetermined.
          Permissions.request('location').then(resp => {
            console.log(resp);
            if (resp === 'authorized') {
              this.debounced();
            } else {
              return;
            }
          });
        } else if (response === 'denied' || response === 'restricted') {
          this.promptEnableGps();
        } else {
          this.debounced();
        }
      });
    } else {
      this.debounced();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    AppState.removeEventListener('change');
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      // Check if root screen is HomeTab.
      this.debounced();
    }
  };

  startGettingLocation() {
    console.log('test');
    apiGeolocation
      .getCurrentPosition()
      .then(result => {
        console.log(result);
        const { latitude, longitude } = result;
        this.setState(() => {
          return { p1: { latlng: { latitude, longitude } }, authorized: true };
        });
        this.map &&
          this.map.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          });
        // Get merchant list:
        apiMerchant
          .getMerchantsNearby({
            lat: latitude,
            long: longitude,
            range: 30000,
            limit: 30
          })
          .then(result => {
            console.log(result);
            if (result.code) {
              const { title, message } = getExceptionMessage(
                result.code,
                result.message
              );
              ToastManager.show(title, message);
              return;
            }
            this.setState({ merchants: result.items });
            const length = result.items.length;
            if (length > 0) {
              const nearest = _.sortBy(
                result.items,
                item =>
                  getDistance(
                    latitude,
                    longitude,
                    item.latitude,
                    item.longitude
                  ).originalValue
              )[0];
              const d = getDistance(
                latitude,
                longitude,
                nearest.latitude, // Nearest
                nearest.longitude
              );
              this.setState({
                distance: d,
                p2: {
                  title: nearest.name,
                  latlng: {
                    latitude: nearest.latitude,
                    longitude: nearest.longitude
                  }
                }
              });
            }
          })
          .catch(e => {
            console.log(e);
            if (!this.unmounted) {
              const { title, message } = getExceptionMessage('UnexpectedError');
              ToastManager.show(title, message);
            }
          });
      })
      .catch(e => {
        console.log(e);
        const { title, message } = getExceptionMessage('UnexpectedError');
        ToastManager.show(title, message);
        if (e.code) {
          Platform.OS === 'android' && this.promptEnableGps();
        }
      });
  }

  promptEnableGps() {
    if (!this.unmounted) {
      Alert.alert(
        I18n.t('map.location_dialog_title'),
        I18n.t('map.location_dialog_content'),
        [
          {
            text: I18n.t('map.cancel'),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: I18n.t('map.ok'),
            onPress: () =>
              SystemSetting.switchLocation(() => console.log('Complete'))
          }
        ],
        { cancelable: false }
      );
    }
  }

  fitTwoMarkers(lat1, lng1, lat2, lng2) {
    // Fit the map screen with two points.
    const DEFAULT_PADDING = { top: 70, right: 70, bottom: 70, left: 70 };
    this.map.fitToCoordinates(
      [
        { latitude: lat1, longitude: lng1 },
        { latitude: lat2, longitude: lng2 }
      ],
      {
        edgePadding: DEFAULT_PADDING,
        animated: true
      }
    );
  }

  requestNearestMerchantDirections() {
    const { merchants, p1 } = this.state;
    if (merchants && merchants.length > 0) {
      if (p1.latlng.latitude !== 0) {
        const sorted = _.sortBy(
          merchants,
          item =>
            getDistance(
              p1.latlng.latitude,
              p1.latlng.longitude,
              item.latitude,
              item.longitude
            ).originalValue
        );
        this.getDirections(sorted[0].latitude, sorted[0].longitude);
      } else {
        ToastManager.show(
          I18n.t('map.location_error_title'),
          I18n.t('map.location_error_content')
        );
      }
    }
  }

  getDirections(lat, lng) {
    const { p1 } = this.state;
    apiGeolocation
      .getDirections(
        p1.latlng.latitude,
        p1.latlng.longitude,
        lat,
        lng,
        'walking'
      )
      .then(result => {
        console.log(result);
        if (result.code) {
          const { title, message } = getExceptionMessage(result.code);
          ToastManager.show(title, message);
          return;
        }
        let points = Polyline.decode(result.routes[0].overview_polyline.points);
        let coords = points.map(point => {
          return {
            latitude: point[0],
            longitude: point[1]
          };
        });
        this.setState({ coords: coords });
        this.fitTwoMarkers(p1.latlng.latitude, p1.latlng.longitude, lat, lng);
      })
      .catch(e => {
        const { title, message } = getExceptionMessage('UnexpectedError');
        ToastManager.show(title, message);
        console.log(e);
      });
  }

  getNearestMerchant() {
    const { p1, merchants } = this.state;
    if (merchants.length < 1) return null;
    return _.sortBy(
      merchants,
      item =>
        getDistance(
          p1.latlng.latitude,
          p1.latlng.longitude,
          item.latitude,
          item.longitude
        ).originalValue
    )[0];
  }

  render() {
    const { p1, p2, merchants, distance, authorized } = this.state;
    console.log(merchants);
    return (
      <View style={styles.container}>
        <Image
          source={require('maps/assets/ic_pin_location.png')}
          style={{ opacity: 0 }}
          resizeMode={'contain'}
        />
        <MapView
          initialRegion={{
            latitude: 21.04356,
            longitude: 105.86923,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
          ref={ref => (this.map = ref)}
          style={styles.map}
          showsUserLocation={authorized}
          minZoomLevel={10}
          region={{
            latitude: p1.latlng.latitude,
            longitude: p1.latlng.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
        >
          {p2.title && (
            <MapView.Marker
              anchor={{ x: 0.5, y: 1 }}
              centerOffset={{ x: 0, y: -8 }}
              coordinate={p2.latlng}
              title={p2.title}
            >
              <View key={Math.random()}>
                <Image
                  source={require('maps/assets/ic_pin_location_small.png')}
                  style={{ height: 22, width: 18 }}
                />
              </View>
            </MapView.Marker>
          )}
          <MapView.Polyline
            coordinates={this.state.coords}
            strokeColor={Colors.RED_PRIMARY}
            strokeWidth={3}
          />
        </MapView>

        <TouchableOpacity
          style={styles.pressable}
          onPress={() =>
            this.map.animateToRegion({
              latitude: p1.latlng.latitude,
              longitude: p1.latlng.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            })
          }
        >
          <Image
            style={styles.currentLocation}
            resizeMode={'contain'}
            source={require('maps/assets/ic_current_location.png')}
          />
        </TouchableOpacity>

        {merchants &&
          merchants.length > 0 && (
            <NearestMerchantCard
              merchant={this.getNearestMerchant()}
              distance={distance}
              onPressAll={this.props.onNext}
              onPressDirection={() => this.requestNearestMerchantDirections()}
            />
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    zIndex: 9000
  },
  pressable: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginBottom: 8
  },
  currentLocation: {
    width: 42,
    height: 42
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
