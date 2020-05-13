import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Colors } from 'common/ui';
import { currencyFormat } from 'utilities';

const getStatus = status => {
  switch (status) {
    case 'completed':
      return 'Thành công';
    case 'failed':
      return 'Thất bại';
    case 'open':
      return 'Đang xử lý';
    case 'forwarded':
      return 'Đã chuyển';
    default:
      break;
  }
};

const RightAngle = () => {
  return (
    <View style={{ height: '100%', width: 15, marginRight: 3 }}>
      <View
        style={{
          flex: 1,
          borderLeftWidth: 1,
          borderBottomWidth: 1,
          borderLeftColor: Colors.BLACK,
          borderBottomColor: Colors.BLACK
        }}
      />
      <View style={{ flex: 1 }} />
    </View>
  );
};
const SubTransactionItem = props => {
  let amount = props.amount;
  let name = props.name;
  return (
    <View
      key={Math.random()}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 2
        }}
      >
        <RightAngle />
        <Text style={styles.promotion}>{name}</Text>
      </View>

      <Text style={styles.promotion}>{amount}</Text>
    </View>
  );
};

const TransactionItem = props => {
  const { onPress, time, name, status, amount, subTransactions } = props;
  let valueOfStatus = getStatus(status);

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        marginBottom: 30,
        paddingLeft: 10,
        paddingBottom: 2,
        width: '100%'
      }}
      onPress={onPress}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingBottom: 3
        }}
      >
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.status}>{valueOfStatus}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Text style={styles.billType}>{name}</Text>
        <Text style={styles.billType}>{amount}</Text>
      </View>
      {subTransactions
        ? subTransactions.map(subItem => (
            <SubTransactionItem
              key={Math.random()}
              name={subItem.name}
              amount={
                (subItem.amount > 0
                  ? '+' + currencyFormat(subItem.amount)
                  : '' + currencyFormat(subItem.amount)) + 'đ'
              }
            />
          ))
        : null}
    </TouchableOpacity>
  );
};

const CircleItem = props => {
  const defaultSize = 40;
  const { size, status, icon, iconStyle } = props;
  const Size = size ? size : defaultSize;
  return (
    <View
      style={{
        width: Size,
        height: Size,
        borderWidth: 1,
        borderRadius: Size / 2,
        borderColor:
          status && status === 'completed' ? Colors.BLACK : Colors.RED, // need fix
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:
          status && status === 'completed' ? Colors.BLACK : Colors.RED // need fix
      }}
    >
      <Image
        source={icon ? icon.icon : null}
        style={[icon ? icon.style : null, iconStyle]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  time: {
    color: Colors.BLACK,
    fontSize: 14
  },
  billType: {
    fontSize: 15,
    color: Colors.BLACK,
    fontWeight: 'bold'
  },
  promotion: {
    color: Colors.BLACK,
    fontSize: 12,
    paddingVertical: 2
  },
  status: {
    fontSize: 14,
    color: Colors.BLUE_SUCCESS
  }
});

export { TransactionItem, CircleItem, getStatus };
