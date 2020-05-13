import React, {Component} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import RechargeMaps from './map-payment';
import {I18n} from 'common';
import {Colors} from 'common/ui';
import {Header, ButtonBack, ButtonClose} from 'common/ui/header';
const {width, height} = Dimensions.get('window');

class Maps extends Component {
  constructor(props) {
    super(props);
  }

  showBody() {
    return (<RechargeMaps onNext={e => {
      this.goNext(e);
    }}/>);
  }
  goNext() {
    this
      .props
      .onClose(false);
  }

  goBack() {
    this
      .props
      .onClose(false);
  }

  showTitle = () => {
    return I18n.t('merchant_list.title_recharge_point');
  };

  render() {
    const {onClose} = this.props;

    return (
      <View style={styles.container}>
        <Header
          style={{
          width: width,
          borderColor: 'rgb(216,216,216)',
          borderBottomWidth: 1
        }}
          headerLeft={< ButtonBack onPress = {
          () => {
            this.goBack();
          }
        } />}
          title={this.showTitle()}
          headerRight={< ButtonClose onPress = {
          () => {
            onClose(false);
          }
        } />}/>
        <View style={styles.containerShowItem}>{this.showBody()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    height: 0.8 * height,
    alignItems: 'center'
  },

  containerShowItem: {
    flex: 10,
    width,
    flexDirection: 'row',
    //alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Maps;
