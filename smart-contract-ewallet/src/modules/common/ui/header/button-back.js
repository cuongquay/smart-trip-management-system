'use strict';

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { Colors } from 'common/ui';

const ButtonBack = ({ onPress, color = Colors.BLACK, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.touch, style]}>
      <Icon
        type="ionicon"
        style={styles.icon}
        color={color}
        name="ios-arrow-back"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touch: {
    marginHorizontal: 3,
    paddingRight: 25,
    paddingLeft: 10,
    backgroundColor: 'transparent'
  },
  icon: {
    color: Colors.WHITE,
    fontSize: 34,
    textAlign: 'center'
  }
});

export { ButtonBack };
