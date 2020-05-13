'use strict';

import Url from 'url';
import React, {Component} from 'react';
import {View, StyleSheet, WebView, ActivityIndicator} from 'react-native';
import {I18n} from 'common';
import {Header, ButtonBack, ButtonBlank} from 'common/ui/header';
import {Card, GradientLayout} from 'common/ui';

export default class Webview extends Component {
  static navigationOptions = () => {
    return {header: null, headerMode: 'screen'};
  };

  constructor(props) {
    super(props);

    this.state = {
      cookie: 'cookie',
      url: ''
    };

    this._onNavigationStateChange = this
      ._onNavigationStateChange
      .bind(this);
  }

  componentWillMount() {
    const url = this.props.navigation.state.params;
    this.setState({url});
  }

  _onNavigationStateChange = webViewState => {
    console.log(Url.parse(webViewState.url));
  };

  webviewLoadingIndicator = () => {
    return (<ActivityIndicator
      size="large"
      style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }}/>);
  };

  render() {
    const {goBack} = this.props.navigation;

    return (
      <GradientLayout style={{
        alignItems: 'stretch'
      }}>
        {/* header of screen */}
        <Header
          componentLeft={< ButtonBack onPress = {
          () => goBack()
        } />}
          componentRight={< ButtonBlank />}
          title={I18n.t('notification_details.header_title')}/> {/* body of screen */}
        <Card
          containerStyle={[
          styles.cardWrapper, {
            marginTop: 5,
            marginHorizontal: 0
          }
        ]}
          column
          rounded>
          <View
            style={{
            flex: 1,
            flexDirection: 'column'
          }}>
            <View style={styles.separator}/>

            <WebView
              ref={c => (this.myWebview = c)}
              onNavigationStateChange={this._onNavigationStateChange}
              javaScriptEnabled
              domStorageEnabled
              injectedJavaScript={this.state.cookie}
              startInLoadingState
              style={{
              flex: 1
            }}
              source={{
              uri: this.state.url
            }}/>
          </View>
        </Card>
      </GradientLayout>
    );
  }
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 0,
    paddingTop: 15,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },

  separator: {
    height: 0.5,
    backgroundColor: '#CED0CE',
    elevation: 2
  }
});
