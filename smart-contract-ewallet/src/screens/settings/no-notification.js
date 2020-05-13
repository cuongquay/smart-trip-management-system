import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { I18n } from 'common';
import { Colors, Text } from 'common/ui';

const NoNotification = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('assets/home/noNotiIc.png')}
        style={styles.image}
      />
      <Text style={styles.text}>{I18n.t('notification.empty')}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE
  },
  image: {
    height: 94,
    width: 80
  },
  text: {
    marginTop: 20,
    fontSize: 17,
    color: Colors.BLACK,
    fontWeight: 'bold'
  }
});
export { NoNotification };
