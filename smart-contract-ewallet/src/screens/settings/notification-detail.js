import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Platform,
  DeviceEventEmitter
} from 'react-native';
import { ToastManager, Events, I18n } from 'common';
import { Text, Colors } from 'common/ui';
import { connect } from 'react-redux';
import HTMLView from 'react-native-htmlview';
import { unix } from 'moment';
import { Header, ButtonBack } from 'common/ui/header';
import { apiNotification } from 'apis/api-notification';
import { setLoading } from 'actions/actions-common';
import { getExceptionMessage } from 'utilities';

const { width, height } = Dimensions.get('window');
class NotificationDetail extends Component {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    this.loading = false;
    this.state = {
      title: '',
      createdAt: '',
      image: '',
      detailsContent: ''
    };
  }

  componentWillMount() {
    this.onNotificationDetails();
  }
  onNotificationDetails = () => {
    const { dispatch } = this.props;
    const notify_id = this.props.navigation.state.params.notify_id;
    this.loading = true;
    apiNotification
      .getNotificationsDetail(this.props.user.id, notify_id)
      .then(result => {
        this.loading = false;
        dispatch(setLoading(false));
        if (!result) {
          return;
        }
        if (result.code) {
          const { title, message } = getExceptionMessage(result.code);
          ToastManager.show(title, message);
          return;
        }

        this.setState({
          title: result.title,
          createdAt: unix(result.created_at).format('DD-MM-YYYY HH:mm:ss'),
          image: result.image,
          detailsContent: result.detailed_content
        });
        DeviceEventEmitter.emit(Events.UPDATE_NOTIFICATION, result);
      })
      .catch(e => {
        this.loading = false;
        dispatch(setLoading(false));
        const { title, message } = getExceptionMessage('UnexpectedError');
        ToastManager.show(title, message);
        console.log(e);
      });
  };
  render() {
    const { title, image, createdAt, detailsContent } = this.state;
    console.log('detail', detailsContent);
    return (
      <View style={styles.container}>
        <Header
          headerLeft={
            <ButtonBack
              onPress={() => {
                this.props.navigation.goBack();
              }}
            />
          }
          styleTitle={{
            fontWeight: '500',
            fontSize: 19
          }}
          title={I18n.t('notification.details')}
          titleColor={Colors.BLACK}
          noMarginTop={Platform.OS === 'ios'}
        />
        <ScrollView>
          <Image
            source={{
              uri: image
            }}
            style={styles.image}
          />
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.createdAt}>{createdAt}</Text>
            <View style={styles.detailsContent}>
              <HTMLView
                addLineBreak={false}
                value={detailsContent}
                stylesheet={htmlStyles}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    backgroundColor: Colors.WHITE
  },
  content: {
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  image: {
    marginBottom: 15,
    alignSelf: 'center',
    width: width,
    height: 0.36 * height,
    resizeMode: 'stretch'
  },
  title: {
    fontSize: 18,
    color: Colors.BLACK
  },
  createdAt: {
    marginTop: 5,
    fontSize: 14,
    color: 'rgba(129,141,162,1)'
  },
  detailsContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.BLACK,
    paddingTop: 10,
    marginTop: 5
  }
});

/*eslint-disable react-native/no-unused-styles */
const htmlStyles = StyleSheet.create({
  br: {
    marginTop: Platform.OS === 'ios' ? -6 : -3,
    marginBottom: Platform.OS === 'ios' ? -6 : -3
  },
  span: {
    marginTop: 5,
    marginBottom: 0
  },
  p: {
    marginTop: 5,
    marginBottom: 0
  },
  div: {
    marginTop: -10,
    marginBottom: -10
  }
});
/*eslint-enable react-native/no-unused-styles */
const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(NotificationDetail);
