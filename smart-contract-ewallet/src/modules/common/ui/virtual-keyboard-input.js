import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from './colors';
import Text from './text-react-native';
import { scale, verticalScale } from 'react-native-size-matters';

const VirtualKeyboardInput = ({
  title,
  value,
  style,
  textStyle,
  hideCursor
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.placeholderWrapper}>
        <Text style={styles.placeholder}>{title}</Text>
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.text, { height: verticalScale(33) }, textStyle]}>
          {value}
        </Text>
        <Text
          style={[
            styles.visible,
            { height: verticalScale(32) },
            hideCursor ? styles.transparent : {}
          ]}
        >{`|`}</Text>
        {value.length > 0 && (
          <TouchableOpacity onPress={onPress} style={styles.buttonDelete}>
            <Image
              style={styles.iconDelete}
              source={require('assets/ic_ononpay_cross_white_circle.png')}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.underline} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  placeholderWrapper: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  placeholder: {
    marginLeft: 3,
    fontSize: scale(21),
    color: Colors.BLUE_SUCCESS
  },
  text: {
    fontSize: scale(25),
    marginTop: 10,
    fontWeight: '500'
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    marginHorizontal: 4,
    marginTop: 5
  },
  buttonDelete: {
    bottom: 5,
    position: 'absolute',
    right: 0
  },
  iconDelete: {
    width: 15,
    height: 15,
    tintColor: '#cecece'
  },
  underline: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.BLUE_SUCCESS
  },
  transparent: {
    fontSize: 18,
    opacity: 0
  },
  visible: {
    fontSize: scale(23),
    opacity: 1
  }
});
export { VirtualKeyboardInput };
