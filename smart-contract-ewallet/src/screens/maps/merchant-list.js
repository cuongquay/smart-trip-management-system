import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { I18n, ToastManager } from 'common';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation';
import _ from 'lodash';
import { apiMerchant, apiGeolocation, getDistance } from 'maps/apis';
import { GradientLayout, Colors, ActionSheet } from 'common/ui';
import { getExceptionMessage } from 'utilities';

const { width } = Dimensions.get('window');

export default class MerchantList extends Component {
  constructor(props) {
    super(props);
    this.latitude = null;
    this.longitude = null;
    this.state = {
      total: 0,
      merchants: [],
      radiusIndex: 'Dưới 1km'
    };
  }

  componentDidMount() {
    this.getMerchantsNearby(1000);
  }

  getMerchantsNearby(radius) {
    const { navigation } = this.props;
    apiGeolocation
      .getCurrentPosition()
      .then(result => {
        const { latitude, longitude } = result;
        this.latitude = latitude;
        this.longitude = longitude;
        return apiMerchant.getMerchantsNearby({
          lat: latitude,
          long: longitude,
          range: radius ? radius : 1000,
          limit: 30
        });
      })
      .then(result => {
        if (!result.code) {
          const list = _.sortBy(
            result.items,
            item =>
              getDistance(
                this.latitude,
                this.longitude,
                item.latitude,
                item.longitude
              ).originalValue
          );
          this.setState({ total: result.total, merchants: list });
        } else if (result.code === 'TokenExpiredException') {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'HomeTabNavigator' })
            ]
          });
          navigation.dispatch(resetAction);
        }
      })
      .catch(e => {
        console.log(e);
        const { title, message } = getExceptionMessage('UnexpectedError');
        ToastManager.show(title, message);
      });
  }

  requestDirection(merchant) {
    this.props.onNext(merchant);
  }

  chooseRange() {
    let btns = ['Dưới 1km', 'Dưới 2km', 'Dưới 5km', 'Hủy'];
    //Platform.OS === 'ios' && btns.push('Hủy');
    const CANCEL_BTN_INDEX = btns.length - 1;
    let params = {
      options: btns,
      cancelButtonIndex: CANCEL_BTN_INDEX,
      title: I18n.t('map.distance_list')
    };
    ActionSheet.showActionSheetWithOptions(params, index => {
      if (index < CANCEL_BTN_INDEX) {
        this.setState({ radiusIndex: btns[index] });
      }
      switch (index) {
        case 0:
          return this.getMerchantsNearby(1000);
        case 1:
          return this.getMerchantsNearby(2000);
        case 2:
          return this.getMerchantsNearby(5000);
        default:
          break;
      }
    });
  }

  render() {
    const { merchants, total, radiusIndex } = this.state;
    console.log(merchants);
    return (
      <GradientLayout
        style={{
          paddingHorizontal: 0
        }}
      >
        <View style={styles.wrapper}>
          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => this.chooseRange()}>
              <View style={styles.dropdownWrapper}>
                <Text style={styles.dropdown}>{radiusIndex}</Text>
                <Ionicons color={'rgb(80,95,121)'} name={'md-arrow-dropdown'} />
              </View>
            </TouchableOpacity>
            <Text style={styles.total}>
              {I18n.t('merchant_list.total_merchants', { total })}
            </Text>
          </View>
          <FlatList
            data={merchants}
            contentContainerStyle={styles.list}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  this.requestDirection({
                    ...item,
                    distance: getDistance(
                      this.latitude,
                      this.longitude,
                      item.latitude,
                      item.longitude
                    )
                  })
                }
                style={styles.contentWrapper}
              >
                <View style={styles.distanceLine}>
                  <Text
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={styles.name}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.distanceLabel}>
                    {' '}
                    {getDistance(
                      this.latitude,
                      this.longitude,
                      item.latitude,
                      item.longitude
                    ).value +
                      ' ' +
                      getDistance(
                        this.latitude,
                        this.longitude,
                        item.latitude,
                        item.longitude
                      ).unit}
                  </Text>
                </View>
                <View style={styles.distanceLine}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    semiBold
                    style={styles.locationName}
                  >
                    {item.address}
                  </Text>
                  <View style={styles.directionWrapper}>
                    <TouchableOpacity
                      onPress={() =>
                        this.requestDirection({
                          ...item,
                          distance: getDistance(
                            this.latitude,
                            this.longitude,
                            item.latitude,
                            item.longitude
                          )
                        })
                      }
                      style={styles.locationIcon}
                    >
                      <FontAwesome
                        style={styles.iconInner}
                        name={'location-arrow'}
                      />
                    </TouchableOpacity>
                    <Text bold style={styles.directionText}>
                      {I18n.t('map.direction')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </GradientLayout>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    width: Dimensions.get('window').width
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: Colors.WHITE
  },
  dropdownWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 4,
    width: width * 0.46,
    borderColor: Colors.BLACK
  },
  dropdown: {
    backgroundColor: 'transparent',
    color: 'rgb(80,95,121)'
  },
  total: {
    color: 'rgb(80,95,121)'
  },
  list: {
    backgroundColor: Colors.WHITE
  },
  contentWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: Dimensions.get('window').width,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.BLACK
  },
  directionWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  locationIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24
  },
  iconInner: {
    backgroundColor: 'transparent',
    color: Colors.BLACK,
    fontSize: 14
  },
  directionText: {
    color: Colors.BLACK,
    marginTop: 4
  },
  distanceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    width: 0.95 * width,
    justifyContent: 'space-between'
  },
  name: {
    maxWidth: Dimensions.get('window').width * 0.5,
    color: 'rgb(47,54,66)',
    fontSize: 16
  },
  distanceLabel: {
    color: Colors.BLACK,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: Colors.BLACK,
    textAlign: 'center',
    marginLeft: 8,
    minWidth: 56,
    fontSize: 13
  },
  locationName: {
    color: 'rgb(80,95,121)',
    fontSize: 14,
    maxWidth: Dimensions.get('window').width * 0.67
  }
});
