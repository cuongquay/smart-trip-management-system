import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Icon } from 'react-native-elements';
import Colors from './colors';

const MaterialInput = ({ onClear, label, showIcon, ...restProps }) => {
  return (
    <TextField
      {...restProps}
      tintColor={Colors.BLACK}
      renderAccessory={() =>
        showIcon && (
          <Icon
            type="ionicon"
            name="md-close-circle"
            size={21}
            color={Colors.BLACK}
            onPress={onClear}
          />
        )
      }
      inputContainerStyle={styles.inputContainer}
      label={label}
    />
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  inputContainer: {
    width: width * 0.9
  }
});

MaterialInput.defaultProps = {
  label: ''
};
export default MaterialInput;
