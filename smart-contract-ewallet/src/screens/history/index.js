import React, { Component } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { I18n } from 'common';
import { Colors, Text } from 'common/ui';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { ButtonBack, ButtonBlank } from 'common/ui/header';
import { apiCustomer } from 'apis/api-customer';
import { Activities } from 'history/activities';
import { currencyFormat } from 'utilities';

import { TransactionItem, CircleItem } from './items';

const { width, height } = Dimensions.get('window');

class TransactionHistory extends Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;
    return {
      title: I18n.t('drawer.transaction_history'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK} />,
      headerRight: <ButtonBlank />,
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center'
      }
    };
  };

  constructor(props) {
    super(props);
    this.page = 1;
    this.total = 0;
    this.state = {
      transactions: [],
      loading: false
    };
  }
  componentWillMount() {
    const { loading } = this.state;
    if (!loading) {
      this.load(this.page);
    }
  }

  load(page) {
    const { user } = this.props;
    this.setState({
      loading: true
    });
    apiCustomer
      .getTransactionList(page, 20, user.id)
      .then(result => {
        this.setState({ loading: false });
        if (!result.code) {
          console.log('result', result);
          this.page = result.current_page + 1;
          this.setState({
            transactions: this.state.transactions.concat(result)
          });
        }
      })
      .catch(e => console.log(e));
  }
  showTransactionDetail(id) {
    this.props.navigation.navigate('TransactionHistoryDetailScreen', {
      id
    });
  }
  getTransactionActivity(activity) {
    const item = _.find(Activities, {
      activity: activity ? activity : 'buy_prepaid'
    });
    return item;
  }

  renderItems = ({ item, index }) => {
    // check item is the same day with the previous trasaction or not
    let sameDay = false;
    // check item is the last transaction of that day or not
    let lastTransactionOfDay = false;
    let totalOfTransaction = this.state.transactions.length;

    let date = moment(item.created_at).format('DD/MM/YYYY');
    let time = moment(item.created_at).format('hh:mm A');

    let icon = this.getTransactionActivity(item.activity);
    let name = item.name;
    let status = item.status;
    let amount =
      item.amount >= 0
        ? '+' + currencyFormat(item.amount) + 'đ'
        : '' + currencyFormat(item.amount) + 'đ';

    if (index > 0) {
      let dateOfPreTransaction = moment(
        this.state.transactions[index - 1].created_at
      ).format('DD/MM/YYYY');
      if (
        moment(date, 'DD/MM/YYY').isSame(
          moment(dateOfPreTransaction, 'DD/MM/YYY')
        )
      )
        sameDay = true;
    }

    if (index === totalOfTransaction - 1) lastTransactionOfDay = true;
    else {
      let dateOfNextTransaction = moment(
        this.state.transactions[index + 1].created_at
      ).format('DD/MM/YYYY');

      if (
        !moment(date, 'DD/MM/YYY').isSame(
          moment(dateOfNextTransaction, 'DD/MM/YYY')
        )
      )
        lastTransactionOfDay = true;
    }
    let subTransactions = _.has(item, 'items') ? item.items : null;
    return (
      <View style={{ width: '100%' }}>
        {!sameDay && (
          <Text
            style={{
              fontSize: 17,
              marginBottom: 10,
              color: Colors.BLACK
            }}
          >
            {'Ngày ' + date}
          </Text>
        )}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignItems: 'center' }}>
            <CircleItem icon={icon} status={item.status} />
            {!lastTransactionOfDay && (
              <View
                style={{
                  flex: 1,
                  width: 0.3,
                  borderWidth: 1,
                  borderColor: Colors.BLACK
                }}
              />
            )}
          </View>
          <TransactionItem
            onPress={() => this.showTransactionDetail(item.id)}
            name={name}
            status={status}
            time={time}
            amount={amount}
            subTransactions={subTransactions}
          />
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.transactions}
          renderItem={this.renderItems}
          keyExtractor={item => item.id.toString()}
          style={{ flex: 1, width: width, paddingHorizontal: 10 }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    width: width,
    height: height,
    alignItems: 'center'
  }
});

const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(TransactionHistory);
