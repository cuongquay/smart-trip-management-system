import React from 'react';
import { View, StyleSheet } from 'react-native';
import { I18n } from 'common';
import { Colors, Text } from 'common/ui';

const CheckoutOrTopUpContent = ({
  date,
  orderId,
  billedAmount,
  discountAmount,
  totalAmount,
  payAt,
  payWith,
  status
}) => {
  return (
    <View style={styles.content}>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.time')}</Text>
        <Text style={styles.value}>{date}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.order_id')}</Text>
        <Text style={styles.value}>{orderId}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.billed_amount')}</Text>
        <Text style={styles.value}>{billedAmount}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.discount_amount')}</Text>
        <Text style={styles.value}>{discountAmount}</Text>
      </View>
      <View style={styles.blank} />
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.total_amount')}</Text>
        <Text style={styles.value}>{totalAmount}</Text>
      </View>
      {payAt ? (
        <View style={styles.detail}>
          <Text style={styles.text}>{I18n.t('transaction.pay_at')}</Text>
          <Text style={styles.value}>{payAt}</Text>
        </View>
      ) : (
        <View style={styles.detail}>
          <Text style={styles.text}>{I18n.t('transaction.pay_with')}</Text>
          <Text style={styles.value}>{payWith}</Text>
        </View>
      )}
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.status')}</Text>
        <Text style={[styles.value, { color: Colors.BLACK }]}>{status}</Text>
      </View>
    </View>
  );
};

const TranfersContent = ({
  date,
  orderId,
  billedAmount,
  discountAmount,
  totalAmount,
  destinationUserName,
  phone,
  tranfersMessage,
  status
}) => {
  return (
    <View style={styles.content}>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.time')}</Text>
        <Text style={styles.value}>{date}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.order_id')}</Text>
        <Text style={styles.value}>{orderId}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.billed_amount')}</Text>
        <Text style={styles.value}>{billedAmount}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.discount_amount')}</Text>
        <Text style={styles.value}>{discountAmount}</Text>
      </View>
      <View style={styles.blank} />
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.total_amount')}</Text>
        <Text style={styles.value}>{totalAmount}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>
          {I18n.t('transaction.destination_user')}
        </Text>
        <Text style={styles.value}>{destinationUserName}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('modal.phone')}</Text>
        <Text style={styles.value}>{phone}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>
          {I18n.t('transaction.transfers_content')}
        </Text>
        <Text style={styles.value}>{tranfersMessage}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.status')}</Text>
        <Text style={[styles.value, { color: Colors.BLACK }]}>{status}</Text>
      </View>
    </View>
  );
};

const ReciverContent = ({
  date,
  orderId,
  billedAmount,
  sourceUserName,
  phone,
  tranfersMessage,
  status
}) => {
  return (
    <View style={styles.content}>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.time')}</Text>
        <Text style={styles.value}>{date}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.order_id')}</Text>
        <Text style={styles.value}>{orderId}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.money_recived')}</Text>
        <Text style={styles.value}>{billedAmount}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.source_user')}</Text>
        <Text style={styles.value}>{sourceUserName}</Text>
      </View>
      <View style={styles.blank} />
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('modal.phone')}</Text>
        <Text style={styles.value}>{phone}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>
          {I18n.t('transaction.transfers_content')}
        </Text>
        <Text style={styles.value}>{tranfersMessage}</Text>
      </View>
      <View style={styles.detail}>
        <Text style={styles.text}>{I18n.t('transaction.status')}</Text>
        <Text style={[styles.value, { color: Colors.BLACK }]}>{status}</Text>
      </View>
    </View>
  );
};

const SubTransaction = ({ name, amount }) => {
  return (
    <View>
      <View style={styles.detail}>
        <Text style={styles.text}>{name}</Text>
        <Text style={styles.value}>{amount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10
  },
  text: {
    color: Colors.BLACK,
    fontSize: 15
  },
  value: {
    color: Colors.BLACK,
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 5
  },
  blank: {
    width: '100%',
    height: 10,
    backgroundColor: Colors.WHITE
  }
});

export {
  CheckoutOrTopUpContent,
  TranfersContent,
  ReciverContent,
  SubTransaction
};
