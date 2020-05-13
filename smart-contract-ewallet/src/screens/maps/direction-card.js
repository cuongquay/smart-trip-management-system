import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { Text, Card, Dot, Colors } from 'common/ui';

const { width } = Dimensions.get('window');

const DirectionCard = ({ destinationName, destinationAddress, distance }) => {
  return (
    <Card rounded column dropShadow containerStyle={styles.cardStyle}>
      <View style={styles.contentWrapper}>
        <View style={[styles.row]}>
          <MaterialIcons name={'my-location'} size={18} color={Colors.BLACK} />
          <Text bold style={styles.placeName}>
            Vị trí của bạn
          </Text>
        </View>

        <Dot style={styles.dot} />
        <Dot style={styles.dot} />

        <View style={[styles.row]}>
          <Entypo name={'location-pin'} size={18} color={Colors.BLACK} />
          <Text bold style={styles.placeName}>
            {destinationName}
          </Text>
        </View>

        <View style={[styles.row, styles.last]}>
          <Text
            ellipsizeMode="tail"
            bold
            numberOfLines={1}
            style={styles.directionText}
          >
            {destinationAddress}
          </Text>
          <Text multiline={false} style={styles.distanceLabel}>
            {`${distance.value} ${distance.unit}`}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    width: width * 0.95,
    alignSelf: 'center',
    paddingVertical: 12
  },
  contentWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  dot: {
    marginLeft: 7,
    marginVertical: 2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    width: width * 0.9
  },
  last: {
    marginTop: -2,
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  placeName: {
    fontSize: 13,
    marginLeft: 12,
    color: Colors.BLACK
  },
  directionText: {
    color: Colors.BLACK,
    marginTop: 8,
    maxWidth: width * 0.6,
    fontSize: 12,
    marginLeft: 30
  },
  distanceLabel: {
    color: Colors.RED_PRIMARY,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'red',
    textAlign: 'center',
    marginLeft: 8,
    minWidth: 62,
    fontSize: 13
  }
});

export { DirectionCard };
