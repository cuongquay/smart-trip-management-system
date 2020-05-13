import React, {Component} from 'react';
import {View, StyleSheet, Dimensions, Linking} from 'react-native';
import {ButtonBack, ButtonBlank} from 'common/ui/header';
import {I18n} from 'common';
import {Colors, Text} from 'common/ui'

class TOS extends Component {
  static navigationOptions = ({navigation}) => {
    const {goBack} = navigation;
    return {
      title: I18n.t('common.tos'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK}/>,
      headerRight: <ButtonBlank/>,
      headerTitleStyle: {
        width: width * 0.9,
        textAlign: 'center',
        alignSelf: 'center'
      }
    };
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {I18n.t('common.term_condition_title')}
        </Text>
        <Text style={styles.text}>
          {I18n.t('common.term_condition')}
          <Text
            style={[
            styles.buttonLink, {
              fontWeight: '700'
            }
          ]}
            onPress={() => Linking.openURL('https://tripcontract.com/terms')}>
            {I18n.t('common.term_condition_link')}
          </Text>
        </Text>
      </View>
    );
  }
}

let {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 10,
    backgroundColor: '#fff'
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonLink: {
    fontWeight: '700',
    fontSize: 15,
    color: '#4aadcd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: 'black'
  }
});

export default TOS;
