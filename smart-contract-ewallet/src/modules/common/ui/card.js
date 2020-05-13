/**
 * @flow
 */

'use strict';

import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Colors from './colors';

const { width } = Dimensions.get('window');

const Card = ({
  dropShadow,
  column,
  rounded,
  fluid,
  containerStyle,
  children
}) => {
  const getStyle = () => {
    let applied = styles.container;
    if (column) {
      applied = StyleSheet.flatten([applied, styles.column]);
    }
    if (dropShadow) {
      applied = StyleSheet.flatten([applied, styles.shadow]);
    }
    if (rounded) {
      applied = StyleSheet.flatten([applied, styles.rounded]);
    }
    if (fluid) {
      applied = StyleSheet.flatten([applied, styles.fluid]);
    }

    return StyleSheet.flatten([applied, containerStyle]);
  };

  return <View style={getStyle()}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 8,
    alignSelf: 'stretch'
  },
  column: {
    flexDirection: 'column'
  },
  rounded: {
    borderRadius: 15
  },
  fluid: {
    width
  }
});

export default Card;
