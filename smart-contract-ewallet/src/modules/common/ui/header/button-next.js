'use strict';

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

const ButtonNext = props => {
  const { onPress, style } = props;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.touch, style]}>
      <Icon
        type="ionicon"
        name="ios-arrow-forward"
        size={24}
        color={'rgb(193,199,208)'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touch: {
    backgroundColor: 'transparent',
    paddingLeft: 10,
    alignItems: 'center'
  }
});

export { ButtonNext };
