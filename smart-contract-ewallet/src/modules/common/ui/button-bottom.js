import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Colors from './colors';
import Text from './text-react-native';

const ButtonBottom = ({
  onPress,
  title,
  offset,
  extraElement,
  disabled,
  backgroundColor = Colors.BLACK,
  textColor = Colors.WHITE
}) => {
  let applied = {};
  if (backgroundColor) {
    applied.backgroundColor = backgroundColor;
  }
  if (offset) {
    applied.bottom = offset;
  }
  if (disabled) {
    applied.backgroundColor = Colors.BLACK;
  }

  return (
    <TouchableOpacity
      onPress={!disabled ? onPress : null}
      style={[styles.bottomWrapper, applied]}
    >
      <View style={styles.row}>
        {extraElement && React.cloneElement(extraElement)}
        <Text semiBold style={[styles.bottomText, { color: textColor }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bottomWrapper: {
    paddingVertical: 15,
    backgroundColor: Colors.BLACK,
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  bottomText: {
    color: Colors.WHITE,
    marginLeft: 10,
    textAlign: 'center',
    fontSize: 17
  }
});

export default ButtonBottom;
