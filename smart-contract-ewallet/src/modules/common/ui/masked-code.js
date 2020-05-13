import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from './colors';
import Text from './text-react-native';

const MaskedCode = ({ value = [], dashed, onFull }) => {
  const arr = [1, 1, 1, 1, 1, 1];
  value.length === 6 && onFull(value);

  return (
    <View style={styles.wrapper}>
      {arr.map(
        (item, idx) =>
          dashed ? (
            <View key={Math.random()} style={styles.dash}>
              {value[idx] ? (
                <Text style={styles.num} semiBold>
                  {value[idx]}
                </Text>
              ) : (
                <View style={[idx === value.length ? styles.cursor : {}]} />
              )}
            </View>
          ) : (
            <View
              key={Math.random()}
              style={[styles.dot, idx <= value.length - 1 ? styles.active : {}]}
            />
          )
      )}
    </View>
  );
};

MaskedCode.defaultProps = {
  onFull: () => {}
};

const SIZE = 24;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row'
  },
  dot: {
    backgroundColor: Colors.WHITE,
    marginHorizontal: 6,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    borderColor: Colors.WHITE
  },
  active: {
    backgroundColor: Colors.BLACK,
    borderColor: Colors.BLACK
  },
  dash: {
    width: 32,
    height: 32,
    alignItems: 'center',
    borderBottomWidth: 2,
    marginHorizontal: 6,
    borderBottomColor: Colors.WHITE
  },
  cursor: {
    height: 26,
    width: 1.5,
    backgroundColor: Colors.WHITE
  },
  num: {
    fontSize: 18
  }
});
export default MaskedCode;
