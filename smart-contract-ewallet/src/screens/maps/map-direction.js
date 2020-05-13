import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { I18n, ToastManager  } from 'common';
import { Colors  } from 'common/ui';
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import { DirectionCard } from 'maps/direction-card';
import { apiGeolocation } from 'maps/apis';
import { getExceptionMessage } from 'utilities';

export default class MapDirection extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    const { latitude, longitude, name } = props.merchant;
    this.state = {
      p1: {
        latlng: { latitude: 0, longitude: 0 }
      },
      p2: {
        title: name,
        latlng: { latitude, longitude }
      },
      coords: []
    };
  }

  async componentWillMount() {
    const { latitude, longitude } = await apiGeolocation.getCurrentPosition();
    this.getDirections(latitude, longitude);
    this.setState(() => {
      return {
        p1: {
          latlng: { latitude, longitude },
          title: I18n.t('map.current_location')
        }
      };
    });
  }

  fitMarkers(data) {
    // Fit the map screen with two points.
    const DEFAULT_PADDING = { top: 70, right: 70, bottom: 70, left: 70 };
    this.map.fitToCoordinates(data, {
      edgePadding: DEFAULT_PADDING,
      animated: true
    });
  }

  getDirections(lat, lng) {
    const { p2 } = this.state;
    apiGeolocation
      .getDirections(lat, lng, p2.latlng.latitude, p2.latlng.longitude)
      .then(r => {
        console.log(r);
        let points = Polyline.decode(r.routes[0].overview_polyline.points);
        let coords = points.map(point => {
          return {
            latitude: point[0],
            longitude: point[1]
          };
        });
        this.setState({ coords });
        this.fitMarkers(coords);
      })
      .catch(e => {
        console.log(e);
        const { title, message } = getExceptionMessage('UnexpectedError');
        ToastManager.show(title, message);
      });
  }

  render() {
    const { p1, p2 } = this.state;
    const { name, address, distance } = this.props.merchant;
    console.log(p1);

    return (
      <View style={styles.container}>
        <MapView
          initialRegion={{
            latitude: 21.04356,
            longitude: 105.86923,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
          ref={ref => (this.map = ref)}
          style={styles.map}
          showsUserLocation
          showsMyLocationButton
          region={{
            latitude: p1.latlng.latitude,
            longitude: p1.latlng.longitude,
            latitudeDelta: 0.0422,
            longitudeDelta: 0.0421
          }}
          minZoomLevel={5}
        >
          {p1.title && (
            <MapView.Marker
              coordinate={p1.latlng}
              title={I18n.t('map.current_location')}
            />
          )}
          {p1.title && (
            <MapView.Polyline
              coordinates={this.state.coords}
              strokeColor={Colors.RED_PRIMARY}
              strokeWidth={3}
            />
          )}
          {p2.title && (
            <MapView.Marker coordinate={p2.latlng} title={p2.title}>
              <Image
                source={require('maps/maps/assets/ic_pin_location_small.png')}
                style={{ height: 22, width: 18 }}
              />
            </MapView.Marker>
          )}
        </MapView>

        <TouchableOpacity
          style={styles.pressable}
          onPress={() =>
            p1.latlng.latitude !== 0 &&
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

        <DirectionCard
          destinationAddress={address}
          destinationName={name}
          distance={distance}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12
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
