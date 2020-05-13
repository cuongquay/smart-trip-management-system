import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from './colors';

const Dot = ({ style }) => {
  return <View style={[styles.dot, style]} />;
};

const styles = StyleSheet.create({
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.BLACK
  }
});

export default Dot;
