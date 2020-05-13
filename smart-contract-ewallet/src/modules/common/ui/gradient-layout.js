/**
 * @flow
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import Colors from './colors';
import LinearGradient from 'react-native-linear-gradient';

const GradientLayout = ({
  firstColor = Colors.WHITE, //Colors.WHITE,
  secondColor = Colors.GREYISH_BROWN, //Colors.GREYISH_BROWN,
  children,
  style
}) => {
  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 0.0, y: 1.0 }}
      colors={[firstColor, secondColor]}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
});

export default GradientLayout;
