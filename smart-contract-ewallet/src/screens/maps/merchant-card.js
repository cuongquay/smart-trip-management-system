import React from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { I18n } from 'common';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Text, Card, Colors } from 'common/ui';

const { width } = Dimensions.get('window');
const CircleIcon = ({ source, style }) => {
  return (
    <View style={[styles.containerIcon, style]}>
      <Image style={styles.storeIcon} resizeMode={'contain'} source={source} />
    </View>
  );
};
const NearestMerchantCard = ({
  merchant,
  distance,
  onPressDirection,
  onPressAll
}) => {
  console.log(merchant);
  return (
    <Card rounded column dropShadow containerStyle={styles.cardStyle}>
      <View style={styles.contentWrapper}>
        <View
          style={{
            width: 0.9 * width,
            justifyContent: 'center'
          }}
        >
          <Text bold style={styles.distanceHeading}>
            {I18n.t('map.nearest_merchant').toUpperCase()}
          </Text>
          <View style={styles.distanceLine}>
            <View
              style={{
                flexDirection: 'row'
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                semiBold
                style={styles.marchantName}
              >
                {merchant.name}
              </Text>
              <CircleIcon
                style={{
                  marginLeft: 10,
                  marginRight: 8
                }}
                source={require('maps/assets/icon-purcha.png')}
              />
              <CircleIcon source={require('maps/assets/icon-money.png')} />
            </View>
            <Text multiline={false} style={styles.distanceLabel}>
              {distance.value + ' ' + distance.unit}
            </Text>
          </View>
          <View style={styles.containerAddress}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              semiBold
              style={styles.locationName}
            >
              {merchant.address}
            </Text>
            <TouchableOpacity
              onPress={onPressDirection}
              style={styles.locationIcon}
            >
              <FontAwesome style={styles.iconInner} name={'location-arrow'} />
              <Text ellipsizeMode="tail" bold style={styles.directionText}>
                {I18n.t('map.direction')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.separator} />
      <View
        style={{
          flexDirection: 'row',
          width: width * 0.87,
          justifyContent: 'space-between'
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            onPressAll(false);
          }}
        >
          <View style={styles.bottomWrapper}>
            <CircleIcon source={require('maps/assets/icon-purcha.png')} />
            <Text
              bold
              style={{
                color: Colors.BLACK,
                fontSize: 17
              }}
            >
              Điểm thanh toán
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => {
            onPressAll(true);
          }}
        >
          <View
            style={[
              styles.bottomWrapper,
              {
                alignItems: 'flex-end'
              }
            ]}
          >
            <CircleIcon source={require('maps/assets/icon-money.png')} />
            <Text
              bold
              style={{
                color: Colors.BLACK,
                fontSize: 17
              }}
            >
              Điểm nạp
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Card>
  );
};

NearestMerchantCard.defaultProps = {
  distance: 0
};

const styles = StyleSheet.create({
  cardStyle: {
    width: width * 0.97,
    alignSelf: 'center',
    paddingVertical: 12
  },
  contentWrapper: {
    width: width * 0.96,
    alignItems: 'center',
    marginBottom: 10
  },
  locationIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  iconInner: {
    backgroundColor: 'transparent',
    color: Colors.BLACK,
    fontSize: 16,
    marginRight: 5
  },
  distanceHeading: {
    fontSize: 16,
    color: Colors.BLACK,
    marginBottom: 8
  },
  directionText: {
    color: Colors.BLACK,
    maxWidth: width * 0.6,
    fontSize: 15
  },
  distanceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    justifyContent: 'space-between',
    width: width * 0.9
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
    minWidth: 60,
    fontSize: 14
  },
  locationName: {
    color: Colors.BLACK,
    fontSize: 14,
    maxWidth: Dimensions.get('window').width * 0.6
  },
  separator: {
    height: 1,
    width: width * 0.9,
    alignSelf: 'center',
    marginVertical: 10,
    backgroundColor: Colors.BLACK
  },
  bottomWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    alignSelf: 'stretch'
  },
  storeIcon: {
    width: 15,
    height: 15
  },
  containerAddress: {
    flexDirection: 'row',
    width: 0.9 * width,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3
  },
  marchantName: {
    fontSize: 19,
    color: 'rgb(47,54,66)',
    fontWeight: '500'
  },
  containerIcon: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgb(47,54,66)',
    width: 23,
    height: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6
  }
});

export { NearestMerchantCard };
