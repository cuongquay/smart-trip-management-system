import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView
} from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { I18n } from 'common';
import { Text, Colors } from 'common/ui';
import { ButtonBack, ButtonBlank } from 'common/ui/header'
import { currencyFormat } from 'utilities';

let { width } = Dimensions.get('window');

class MoneyManagement extends Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;
    return {
      title: I18n.t('money_management.title'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK} />,
      headerRight: <ButtonBlank />,
      headerTitleStyle: {
        width: width * 0.9,
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 19
      }
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      showLinkedBankAccount: false,
      showDefaultOnOnPayAccount: false
    };
  }
  componentWillMount() {
    console.log(this.props.user);
  }
  render() {
    const { navigation, user } = this.props;
    const { current_balance, currency, default_account } = user;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
        <View style={styles.containerHeader}>
          <View style={{ width: 0.93 * width }}>
            <ImageBackground
              resizeMode="contain"
              source={require('assets/home/atm_card.png')}
              style={styles.backgroundImageBank}
            >
              <View style={styles.containerBody}>
                <Text style={styles.text}>
                  {currencyFormat(
                    default_account ? default_account.balance : current_balance
                  )}
                  {currency}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name="check"
                    type="material-community"
                    color={Colors.WHITE}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.text, { fontSize: 16 }]}>
                    {I18n.t('money_management.using')}
                  </Text>
                </View>
              </View>
            </ImageBackground>
            {this.state.showLinkedBankAccount ? (
              <ImageBackground
                imageStyle={{ resizeMode: 'stretch' }}
                source={require('assets/home/logo.png')}
                style={[
                  styles.backgroundImageBank,
                  { justifyContent: 'flex-end', alignItems: 'flex-end' }
                ]}
              >
                <TouchableOpacity style={styles.bottomUse}>
                  <Text style={[styles.text, { fontSize: 16 }]}>
                    {I18n.t('money_management.use')}
                  </Text>
                </TouchableOpacity>
              </ImageBackground>
            ) : null}
            {this.state.showDefaultOnOnPayAccount ? (
              <TouchableOpacity
                style={[styles.containerAddMoney]}
                onPress={() => {
                  navigation.navigate('AddFundsScreen');
                }}
              >
                <Image
                  style={{ width: 40, height: 40 }}
                  source={require('assets/home/addIc.png')}
                />
                <Text
                  style={[
                    styles.text,
                    { color: 'rgb(74,173,205)', fontSize: 17, marginTop: 10 }
                  ]}
                >
                  {I18n.t('money_management.add_new_money_resource')}
                </Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.containerText}>
              <Image
                source={require('assets/home/security.png')}
                style={styles.imageSecurity}
              />
              <Text
                numberOfLines={6}
                style={{
                  fontSize: 13,
                  color: 'rgb(129,141,162)',
                  flex: 1,
                  lineHeight: 20
                }}
              >
                {I18n.t('money_management.ononpay_description')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  containerHeader: {
    width,
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    marginBottom: 10,
    alignItems: 'center'
  },
  backgroundImageBank: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 162,
    borderRadius: 10,
    marginTop: 10
  },
  text: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: '500'
  },
  bottomUse: {
    borderRadius: 20,
    height: 35,
    width: 0.27 * width,
    borderColor: Colors.WHITE,
    borderWidth: 1.5,
    marginBottom: 15,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 0.85 * width,
    marginBottom: 15
  },
  containerAddMoney: {
    height: 113,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    borderColor: 'rgb(74,173,205)',
    borderRadius: 0.5, // hack for borderStyle.
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  containerText: {
    width: width * 0.93,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    borderColor: Colors.WHITE,
    borderWidth: 1,
    //alignItems: 'center',
    justifyContent: 'center'
  },
  imageSecurity: {
    width: 15,
    height: 18,
    marginRight: 7,
    marginTop: 3
  }
});

const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(MoneyManagement);
