import React, { Component } from 'react';
import { StyleSheet, Image, View, Dimensions } from 'react-native';
import { verticalScale } from 'react-native-size-matters'; /*eslint-disable-line no-unused-vars*/
import { apiInsights } from 'apis/api-insight-news';
import FlipCard from 'react-native-flip-card'; /*eslint-disable-line no-unused-vars*/
import { I18n } from 'common';
import { Colors } from 'common/ui';
let { width, height } = Dimensions.get('window');

const defaultNewsUrl = './assets/default.png';

export class Feeds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: defaultNewsUrl,
      title: I18n.t('home.insight_news.title'),
      description: I18n.t('home.insight_news.description'),
      start_date: '--/--/----',
      end_date: '--/--/----',
      status: 'DISCONNECTED'
    };
  }

  componentWillMount() {
    apiInsights
      .getNews(this.props.user.id)
      .then(result => {
        console.log(result);
        this.setState({
          image: result.image,
          title: result.title,
          description: result.description,
          start_date: result.start_date,
          end_date: result.end_date,
          status: result.status
        });
      })
      .catch(e => {
        this.setState({
          image: defaultNewsUrl,
          title: 'Bạn không có tin nào mới',
          description: e.message
        });
      });
  }

  render() {
    const {
      image /*eslint-disable-line no-unused-vars*/,
      title /*eslint-disable-line no-unused-vars*/,
      description /*eslint-disable-line no-unused-vars*/,
      start_date /*eslint-disable-line no-unused-vars*/,
      end_date /*eslint-disable-line no-unused-vars*/,
      status /*eslint-disable-line no-unused-vars*/
    } = this.state;
    return (
      <View style={styles.containerWrapper}>
        <Image
          style={styles.insightNews}
          resizeMode="cover"
          source={{
            uri: this.state.image + '?' + Date.now()
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  insightNews: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.WHITE
  },
  containerWrapper: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    height: height * 0.9,
    width: width
  }
});
