import React, { Component } from 'react';
import { View, StyleSheet, Image, DeviceEventEmitter } from 'react-native';
import { phonecall } from 'react-native-communications';

import { Events, I18n } from 'common';
import { Text, Colors, ButtonBottom } from 'common/ui';

class AccountLocked extends Component {
  static navigationOptions = {
    header: null
  };

  onBack() {
    const { navigation } = this.props;
    navigation.goBack();
    DeviceEventEmitter.emit(Events.RELOAD_PHONE_NUMBER);
  }

  render() {
    const { params } = this.props.navigation.state;

    return (
      <View style={styles.container}>
        <Image
          source={require('assets/ic_lock_grey.png')}
          style={styles.lockImg}
          resizeMode="contain"
        />
        <Text semiBold style={styles.locked}>
          {I18n.t(
            params === 'passcode'
              ? 'account_locked.info1'
              : 'account_locked.info2',
            { count: 5 }
          )}
        </Text>

        <Text semiBold style={styles.callCenter} onPress={() => this.onBack()}>
          Nhập số khác
        </Text>

        <ButtonBottom
          onPress={() => phonecall('18006751')}
          extraElement={
            <Image
              source={require('assets/ic_default.png')}
              style={{ width: 26, height: 26 }}
              resizeMode="contain"
            />
          }
          title="Gọi tổng đài hỗ trợ"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE
  },
  lockImg: {
    height: 64,
    marginVertical: 18
  },
  locked: {
    color: Colors.RED,
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 19
  },
  callCenter: {
    color: Colors.BLACK,
    marginVertical: 18,
    fontSize: 18,
    textAlign: 'center'
  }
});

export default AccountLocked;
