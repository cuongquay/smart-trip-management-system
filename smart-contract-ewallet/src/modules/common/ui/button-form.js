import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  Dimensions
} from 'react-native';
const { width, height } = Dimensions.get('window');
const ButtonForm = ({ text, onPress, url, styleText }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Image
        style={{
          height: 30 / 640 * height
        }}
        resizeMode="contain"
        source={url}
      />
      <Text style={[styles.textName, styleText]}>{text}</Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width / 3
  },
  textName: {
    paddingTop: 3,
    fontSize: 14,
    textAlign: 'center',
    color: 'rgb(47,54,66)'
  }
});
export default ButtonForm;
