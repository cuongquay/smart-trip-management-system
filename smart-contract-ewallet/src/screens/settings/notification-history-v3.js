import React, { Component } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  DeviceEventEmitter
} from 'react-native';
import { SwipeRow } from 'react-native-swipe-list-view';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Colors, Text } from 'common/ui';
import { I18n, ToastManager, ModalManager, MessageBox, Events } from 'common';
import {
  Header,
  ButtonBack,
  HEADER_HEIGHT,
  STATUSBAR_HEIGHT
} from 'common/ui/header';
import { apiNotification } from 'apis/api-notification';
import { setLoading } from 'actions/actions-common';
import { getExceptionMessage } from 'utilities';
import { NoNotification } from 'settings/no-notification';

let { height, width } = Dimensions.get('window');

class NotificationHistoryV3 extends Component {
  static navigationOptions = () => {
    return { header: null, headerMode: 'screen' };
  };

  constructor(props) {
    super(props);

    this.page = 1;
    this.morePage = true;
    this.loading = false;
    this.state = {
      historyData: [],
      deletedIndex: null,
      showReloadButton: false
    };
  }

  componentWillMount() {
    if (!this.loading) {
      this.getNotificationData();
    }
    DeviceEventEmitter.addListener(Events.UPDATE_NOTIFICATION, e => {
      this.readData(e);
    });
  }

  readData(notification) {
    let index = _.findIndex(this.state.historyData, function(n) {
      return n.id == notification.id;
    });
    let historyDataEX = this.state.historyData;
    console.log(index);
    if (index != -1) {
      historyDataEX[index] = notification;
      console.log(notification);
    }
    this.setState({ historyData: historyDataEX });
  }
  onEndReached = () => {
    if (this.loading || !this.morePage || this.state.showReloadButton) {
      return;
    }
    this.getNotificationData();
  };

  getNotificationData = () => {
    const { dispatch, user } = this.props;
    const limit = 10;
    this.loading = true;
    apiNotification
      .getNotifications(user.id, limit, this.page)
      .then(result => {
        this.loading = false;
        dispatch(setLoading(false));
        console.log(result);
        if (result.code) {
          const { title, message } = getExceptionMessage(result.code);
          ToastManager.show(title, message);
          if (this.page === 1) this.setState({ showReloadButton: true });
        } else {
          this.setState({
            historyData: this.state.historyData.concat(result.items),
            showReloadButton: false
          });
          this.morePage = result.more_page;
          this.page = result.current_page + 1;
        }
      })
      .catch(e => {
        if (this.page === 1) this.setState({ showReloadButton: true });
        this.loading = false;
        dispatch(setLoading(false));
        const { title, message } = getExceptionMessage('UnexpectedError');
        ToastManager.show(title, message);
        console.log(e);
      });
  };

  setAllAsRead = () => {
    this.loading = true;
    this.setState({ historyData: [] });
    apiNotification
      .markAllAsRead()
      .then(result => {
        this.loading = false;
        console.log('da doc', result);
      })
      .catch(err => {
        this.loading = false;
        console.log(err);
        this.page = 1;
        this.getNotificationData();
      });
  };

  onDeleteNotify(id, index) {
    ModalManager.show(
      <MessageBox
        title={I18n.t('message.notification.delete.title')}
        message={I18n.t('message.notification.delete.confirmation')}
        actions={'ACCEPT|CANCEL'}
        acceptText={I18n.t('message.notification.delete.action')}
        onCancel={ModalManager.dismiss}
        onClose={() => {
          this.onDelete(id, index);
        }}
      />
    );
  }

  onDelete(notify_id, index) {
    ModalManager.dismiss();
    if (this.loading) return;
    const { dispatch } = this.props;
    this.loading = true;
    apiNotification
      .deleteNotification(this.props.user.id, notify_id)
      .then(result => {
        this.loading = false;
        dispatch(setLoading(false));
        console.log('delete', result);
        if (result.code) {
          const { title, message } = getExceptionMessage(result.code);
          ToastManager.show(title, message);
        } else {
          this.state.historyData.splice(index, 1);
          let deletedIndex = Math.random();
          this.setState(
            {
              deletedIndex: deletedIndex
            },
            () => {
              console.log(this.state.deletedIndex);
            }
          );
        }
      })
      .catch(e => {
        this.loading = false;
        dispatch(setLoading(false));
        const { title, message } = getExceptionMessage('UnexpectedError');
        ToastManager.show(title, message);
        console.log(e);
      });
  }
  _keyExtractor = item => item.id;

  renderRowItem = info => {
    let { title, short_content, read_at } = info.item;
    let notify_id = info.item.id;
    return (
      <SwipeRow
        rightOpenValue={-75}
        style={{
          paddingRight: 15,
          width: 0.93 * width
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: 'red',
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            position: 'absolute',
            width: 75,
            top: 0,
            right: 0
          }}
          onPress={() => this.onDeleteNotify(notify_id, info.index)}
        >
          <Text
            style={{
              color: Colors.WHITE
            }}
            semiBold
          >
            XÓA
          </Text>
        </TouchableOpacity>
        <View style={styles.wrapper}>
          <TouchableOpacity
            style={styles.wrapper_message}
            onPress={() => {
              this.props.navigation.navigate('NotificationDetailsScreen', {
                notify_id: notify_id
              });
            }}
          >
            <Image
              style={styles.unreadIcon}
              source={
                read_at
                  ? require('assets/home/noNoti.png')
                  : require('assets/home/noti-ms.png')
              }
            />

            <View style={styles.textWrapper}>
              <Text
                style={styles.title}
                ellipsizeMode={'tail'}
                numberOfLines={1}
                semiBold
              >
                {title}
              </Text>
              <Text
                ellipsizeMode={'tail'}
                numberOfLines={1}
                style={styles.value}
              >
                {short_content}
              </Text>
            </View>
            <Image
              style={styles.detailsIcon}
              source={require('assets/pin_left_gray.png')}
            />
          </TouchableOpacity>
        </View>
      </SwipeRow>
    );
  };

  renderSeparator = () => {
    return <View style={styles.separator} />;
  };

  render() {
    const { navigation } = this.props;
    const { goBack } = navigation;
    const { haveNotification } = navigation.state.params;
    return (
      <View style={styles.container}>
        <Header
          noMarginTop={Platform.OS === 'ios'}
          title={I18n.t('notification.title')}
          styleTitle={{
            fontWeight: '500',
            fontSize: 19
          }}
          style={{
            width: 0.93 * width
          }}
          titleColor={Colors.BLACK}
          headerLeft={
            <ButtonBack
              style={{ marginLeft: 0, paddingLeft: 0 }}
              onPress={() => {
                DeviceEventEmitter.emit(Events.CHECK_NOTIFICATIONS);
                goBack();
              }}
            />
          }
          headerRight={
            this.state.historyData.length > 0 ? (
              <TouchableOpacity onPress={this.setAllAsRead}>
                <Text
                  style={{
                    color: 'rgb(10,162,221)',
                    fontSize: 17
                  }}
                >
                  Đã đọc
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
        <View style={styles.content}>
          {!this.state.showReloadButton ? (
            haveNotification ? (
              <FlatList
                data={this.state.historyData}
                numColumns={1}
                contentContainerStyle={{
                  paddingBottom: Platform.OS === 'ios' ? 80 : 20
                }}
                ItemSeparatorComponent={this.renderSeparator}
                keyExtractor={this._keyExtractor}
                renderItem={data => this.renderRowItem(data)}
                ListFooterComponent={this.loading && <ActivityIndicator />}
                onEndReached={this.onEndReached}
                onEndReachedThreshold={2}
              />
            ) : (
              <NoNotification />
            )
          ) : (
            <TouchableOpacity
              style={styles.buttonRefresh}
              onPress={this.getNotificationData}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: 'white'
                }}
              >
                {I18n.t('notification.refresh')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    backgroundColor: Colors.WHITE,
    width: '100%',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    paddingLeft: 15,
    alignItems: 'center'
  },
  wrapper: {
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center'
  },
  wrapper_message: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12
  },

  unreadIcon: {
    width: 33,
    height: 24,
    resizeMode: 'stretch'
  },

  textWrapper: {
    width: '80%'
  },

  title: {
    fontSize: 17,
    color: '#1C1D3F'
  },

  value: {
    fontSize: 14.5,
    color: '#5A4C4C'
  },

  detailsIcon: {
    width: 10,
    height: 16.5,
    resizeMode: 'stretch'
  },

  separator: {
    height: 1,
    flex: 1,
    marginRight: 15,
    backgroundColor: '#CED0CE'
  },
  buttonRefresh: {
    marginTop: (height - STATUSBAR_HEIGHT - HEADER_HEIGHT) / 2 - 40 / 2, //40 is height of refresh button
    backgroundColor: Colors.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: '80%',
    borderRadius: 5
  }
});

const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(
  NotificationHistoryV3
);
