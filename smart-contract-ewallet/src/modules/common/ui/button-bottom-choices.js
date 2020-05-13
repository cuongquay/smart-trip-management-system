import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { I18n } from 'common';
import Colors from './colors';

const ButtonBottomChoices = ({ onSave, onCancel, offset, enableSave }) => {
  let applied = {};
  if (offset) {
    applied.bottom = offset;
  }

  return (
    <View style={[styles.containerButton, applied]}>
      <TouchableOpacity
        onPress={onCancel}
        style={[
          styles.button,
          {
            backgroundColor: enableSave ? Colors.BLACK : Colors.BLACK
          }
        ]}
      >
        <Text style={styles.label}>{I18n.t('update_profile.cancel')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: enableSave ? Colors.BLACK : Colors.BLACK
          }
        ]}
        onPress={onSave}
      >
        <Text style={styles.label}>{I18n.t('update_profile.save')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.BLACK,
    width: '50%',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    color: Colors.WHITE,
    fontSize: 17,
    fontWeight: '500'
  },
  containerButton: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%'
  }
});

export default ButtonBottomChoices;
