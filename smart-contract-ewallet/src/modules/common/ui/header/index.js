import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { ButtonBack } from './button-back';
import { ButtonClose } from './button-close';
import { ButtonNext } from './button-next';
import { ButtonFlag } from './button-flag';
import { ButtonBlank } from './button-blank';
import { Colors } from 'common/ui';

const HEADER_HEIGHT = Platform.select({
  ios: 44,
  android: 52
});

const STATUSBAR_HEIGHT = Platform.select({
  ios: 20,
  android: 0
});

const Header = ({
  noMarginTop,
  headerLeft,
  headerRight,
  title,
  titleColor = Colors.BLACK,
  absolute,
  transparent,
  style,
  styleTitle
}) => {
  let applied = styles.wrapper;
  if (absolute) {
    applied = StyleSheet.flatten([applied, styles.absolute]);
  }
  if (transparent) {
    applied = StyleSheet.flatten([applied, styles.transparent]);
  }
  if (noMarginTop) {
    applied = StyleSheet.flatten([applied, styles.noMarginTop]);
  }

  return (
    <View style={[applied, style]}>
      {headerLeft}
      {React.isValidElement(title) ? (
        title
      ) : (
        <Text style={[styles.whiteText, { color: titleColor }, styleTitle]}>
          {title}
        </Text>
      )}
      {headerRight ? headerRight : <ButtonBlank />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: HEADER_HEIGHT,
    zIndex: 2,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  noMarginTop: {
    marginTop: 0
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  transparent: {
    opacity: 0.7
  },
  whiteText: {
    fontSize: 18,
    color: Colors.WHITE
  }
});

Header.propTypes = {
  headerLeft: PropTypes.element,
  headerRight: PropTypes.element,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export {
  Header,
  ButtonBack,
  ButtonBlank,
  ButtonClose,
  ButtonNext,
  ButtonFlag,
  STATUSBAR_HEIGHT,
  HEADER_HEIGHT
};
