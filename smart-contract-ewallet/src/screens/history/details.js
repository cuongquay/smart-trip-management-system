import React, { Component } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { I18n } from 'common';
import { Colors, Text } from 'common/ui';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import { ButtonBack, ButtonBlank } from 'header';
import { apiCustomer } from 'apis/api-customer';
import { currencyFormat } from 'utilities';
import { Activities, ChildActivities } from 'history/activities';
import { CircleItem, getStatus } from 'history/items';
import {
  CheckoutOrTopUpContent,
  ReciverContent,
  TranfersContent,
  SubTransaction
} from 'history/contents';

const { width } = Dimensions.get('window');

class TransactionHistoryDetail extends Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;
    return {
      title: I18n.t('transaction.transaction_detail'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK} />,
      headerRight: <ButtonBlank />,
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center'
      }
    };
  };
  constructor() {
    super();
    this.state = {
      content: null
    };
  }
  componentWillMount() {
    this.getTransactionDetail();
  }

  getTransactionDetail = () => {
    let userId = this.props.user.id;
    let transactionId = this.props.navigation.state.params.id;

    apiCustomer
      .getTransactionDetails(userId, transactionId)
      .then(result => {
        console.log('detail', result);
        this.setState({
          content: result
        });
      })
      .catch(e => console.log(e));
  };
  getTransactionContent(
    activity,
    date,
    orderId,
    billedAmount,
    discountAmount,
    totalAmount,
    payAtStoreWith,
    topupAtStoreWith,
    topupOnlineWith,
    destinationUserName,
    phone,
    tranfersMessage,
    sourceUserName,
    status
  ) {
    switch (activity) {
      case 'consumer_topup_into_account_balance_at_store':
        return (
          <CheckoutOrTopUpContent
            date={date}
            orderId={orderId}
            billedAmount={billedAmount}
            discountAmount={discountAmount}
            totalAmount={totalAmount}
            payAt={topupAtStoreWith}
            status={status}
          />
        );
      case 'consumer_topup_into_account_balance':
        return (
          <CheckoutOrTopUpContent
            date={date}
            orderId={orderId}
            billedAmount={billedAmount}
            discountAmount={discountAmount}
            totalAmount={totalAmount}
            payWith={topupOnlineWith}
            status={status}
          />
        );
      case 'consumer_checkout_order_at_store':
        return (
          <CheckoutOrTopUpContent
            date={date}
            orderId={orderId}
            billedAmount={billedAmount}
            discountAmount={discountAmount}
            totalAmount={totalAmount}
            payAt={payAtStoreWith}
            status={status}
          />
        );
      case 'sender_wallet_to_wallet':
        return (
          <TranfersContent
            date={date}
            orderId={orderId}
            billedAmount={billedAmount}
            discountAmount={discountAmount}
            totalAmount={totalAmount}
            destinationUserName={destinationUserName}
            phone={phone}
            tranfersMessage={tranfersMessage}
            status={status}
          />
        );
      case 'receiver_wallet_to_wallet':
        return (
          <ReciverContent
            date={date}
            orderId={orderId}
            billedAmount={billedAmount}
            discountAmount={discountAmount}
            phone={phone}
            tranfersMessage={tranfersMessage}
            sourceUserName={sourceUserName}
            status={status}
          />
        );
    }
  }

  getSubTransactionActivity(activity) {
    let item = _.find(ChildActivities, {
      activity: activity ? activity : 'buy_prepaid'
    });
    return item;
  }
  getTransactionActivity(activity) {
    const item = _.find(Activities, {
      activity: activity
    });
    return item;
  }
  render() {
    const { content } = this.state;
    console.log('item', content);
    if (content) {
      const { order_data } = content;
      // console.log('item', order_data);

      var activity = content.activity;
      var icon = this.getTransactionActivity(content.activity);
      var name = content.name;
      var date = moment(content.created_at).format('DD/MM/YYYY - hh:mm A');

      var orderId = order_data.id;
      var destinationUserName = order_data.dest_user
        ? order_data.dest_user.name
        : '';
      var phone = order_data.dest_user ? order_data.dest_user.username : '';

      var billedAmount =
        (order_data.billed_amount >= 0
          ? '+' + currencyFormat(order_data.billed_amount)
          : currencyFormat(order_data.billed_amount)) + 'đ';

      var discountAmount =
        currencyFormat('-' + order_data.discount_amount) + 'đ';

      var totalAmount =
        (order_data.total_amount >= 0
          ? '+' + currencyFormat(order_data.total_amount)
          : currencyFormat(order_data.total_amount)) + 'đ';

      var topupOnlineWith = _.has(order_data.data, 'bank_name')
        ? order_data.data.bank_name
        : '';
      var topupAtStoreWith = _.has(order_data.src_group, 'name')
        ? order_data.src_group.name
        : '';
      var payAtStoreWith = _.has(order_data.dest_group, 'name')
        ? order_data.dest_group.name
        : '';
      var tranfersMessage = _.has(order_data.data, 'tranfer_message')
        ? order_data.data.tranfer_message
        : '';
      var sourceUserName = order_data.src_user ? order_data.src_user.name : '';

      var status = getStatus(content.status);

      var subTransaction = _.has(content, 'items')
        ? content.items.length > 0
          ? content.items
          : null
        : null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <CircleItem
            size={55}
            icon={icon}
            status={content ? content.status : null}
          />
          <Text style={[styles.text, { fontSize: 17 }]}>{name}</Text>
          <View style={styles.transactionDetail}>
            {content
              ? this.getTransactionContent(
                  activity,
                  date,
                  orderId,
                  billedAmount,
                  discountAmount,
                  totalAmount,
                  payAtStoreWith,
                  topupAtStoreWith,
                  topupOnlineWith,
                  destinationUserName,
                  phone,
                  tranfersMessage,
                  sourceUserName,
                  status
                )
              : null}
          </View>

          {subTransaction ? (
            <View
              style={[
                styles.transactionDetail,
                {
                  flexDirection: 'column',
                  marginTop: 10
                }
              ]}
            >
              {subTransaction.map(item => {
                console.log('name', item.name);
                let name = item.name;
                let amount =
                  (item.amount >= 0
                    ? '+' + currencyFormat(item.amount)
                    : currencyFormat(item.amount)) + 'đ';
                return (
                  <SubTransaction
                    name={name}
                    amount={amount}
                    key={Math.random()}
                  />
                );
              })}
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10
  },
  transactionDetail: {
    flexDirection: 'row',
    width: width,
    justifyContent: 'space-between',
    backgroundColor: Colors.GRAY_BACKGROUND,
    marginTop: 20
  },
  text: {
    color: Colors.BLACK,
    fontSize: 15,
    marginVertical: 5
  }
});

const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(
  TransactionHistoryDetail
);
