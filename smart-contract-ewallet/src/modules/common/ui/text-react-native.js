import React from 'react';
import { Text as TextRN, StyleSheet } from 'react-native';

const Text = ({ regular, bold, semiBold, onPress, style, ...restProps }) => {
  const getVariant = () => {
    if (regular) {
      return 'Averta-Regular';
    }

    if (bold) {
      return 'Averta-Bold';
    }

    if (semiBold) {
      return 'Averta-SemiBold';
    }

    return 'Averta-Regular';
  };

  return (
    <TextRN
      style={StyleSheet.flatten([{ fontFamily: getVariant() }, style])}
      onPress={onPress}
      {...restProps}
    />
  );
};

Text.propTypes = {
  ...TextRN.propTypes
};

export default Text;
