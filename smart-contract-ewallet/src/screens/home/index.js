import React from 'react';
import {
  TouchableOpacity,
  Dimensions,
  View,
  Platform,
  DeviceEventEmitter,
  ScrollView,
  StatusBar,
  AppState
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modalbox';
import { Icon } from 'react-native-elements';
import { I18n, Events, AnimationKeys } from 'common';
import { TextInput, Colors } from 'common/ui';
import { Header } from 'common/ui/header';
import { connect } from 'react-redux';
import moment from 'moment';
import { CheckIn } from 'checkin';
import Orders from 'orders';
import { Feeds } from 'feeds';
import Maps from 'maps';
import { Pages } from 'react-native-pages';
import { apiNotification } from 'apis/api-notification';
import { requestGetAccount } from 'actions/actions-user';
import styles from './_styles';
let { width } = Dimensions.get('window');

const PAGE_NUMBER_DEFAULT = 0;

const HeaderLeft = props => {
  return (
    <TouchableOpacity style={styles.styleButtonHeader} onPress={props.onHome}>
      <Icon
        type="ionicon"
        style={styles.iconButton}
        color={Colors.GREYISH_BROWN}
        name="md-list"
      />
    </TouchableOpacity>
  );
};

const HeaderRight = props => {
  return (
    <TouchableOpacity
      style={styles.styleButtonHeader}
      onPress={props.onHistorys}
    >
      <Icon
        type="ionicon"
        style={styles.iconButton}
        color={Colors.GREYISH_BROWN}
        name={
          props.haveNewNotification
            ? 'md-notifications-outline'
            : 'md-notifications'
        }
      />
    </TouchableOpacity>
  );
};

const HeaderTitle = () => {
  return (
    <TextInput
      value={I18n.t('home.search.title')}
      fontSize={20}
      activated={false}
      borderRadius={4}
      textCenter={false}
      height={40}
    />
  );
};
const HeaderView = props => {
  return (
    <Header
      noMarginTop={Platform.OS === 'ios'}
      title={<HeaderTitle {...props} />}
      headerLeft={<HeaderLeft {...props} />}
      headerRight={<HeaderRight {...props} />}
    />
  );
};

class Home extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.inactivePoint = null;
    this.state = {
      animationUp: null,
      animationDow: null,
      isModalVisible: false,
      haveNewNotification: false,
      haveNotification: false
    };
    this.checkNotification();
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(requestGetAccount());
    DeviceEventEmitter.addListener(Events.CHECK_NOTIFICATIONS, () => {
      this.checkNotification();
    });
    this.checkInactiveApp();
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.sub = navigation.addListener('didFocus', this.onCloseCamera);
  }

  componentWillUnmount() {
    this.sub && this.sub.remove('didFocus');
  }

  onCloseCamera = () => {
    this.closeCamera();
  };

  checkNotification = () => {
    const { user } = this.props;
    apiNotification
      .getBadge(user.id)
      .then(result => {
        let { unread } = result;
        this.setState({
          haveNewNotification: unread > 0,
          haveNotification: result.total > 0
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  async inActivatedOverLongPeriod() {
    console.log('inActivatedOverLongPeriod');
  }

  checkInactiveApp = () => {
    AppState.addEventListener('change', state => {
      console.log(state);
      if (state === 'active') {
        if (this.inactivePoint) {
          const inactiveDuration = moment(new Date()).diff(
            this.inactivePoint,
            'seconds'
          );
          if (Math.abs(inactiveDuration) > (__DEV__ ? 10 : 60)) {
            this.inActivatedOverLongPeriod();
          }
        }
      } else if (state === 'background') {
        this.inactivePoint = moment();
      }
    });
  };

  onModal(chooseModalCard) {
    if (chooseModalCard) {
      this.setState({ isModalVisible: true });
    }
  }

  showModal() {
    return (
      <Maps
        onClose={e => {
          this.setState({ isModalVisible: e });
        }}
        navigation={this.props.navigation}
      />
    );
  }

  openCamera() {
    this.setState({
      animationUp: AnimationKeys.FADE_IN,
      animationDow: AnimationKeys.FADE_IN
    });
    this.props.navigation.navigate('QRScreen', {
      navigationData: this.navigationData.bind(this),
      activity: 'SCAN_QR_CODE'
    });
  }

  closeCamera() {
    this.setState({
      animationUp: AnimationKeys.FADE_IN,
      animationDow: AnimationKeys.FADE_IN
    });
  }

  navigationData(encodedData) {
    console.log('QRCode DETECTED:', encodedData);
  }

  render() {
    const { user } = this.props;
    const { animationUp, animationDow, isModalVisible } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Animatable.View
          duration={50}
          animation={animationUp}
          style={styles.animationViewHeader}
        >
          <HeaderView
            onHome={() => {
              DeviceEventEmitter.emit('DRAWER_TOGGLE', true);
            }}
            onHistorys={() => {
              this.props.navigation.navigate('NotificationHistoryV3Screen', {
                haveNotification: this.state.haveNotification
              });
            }}
            user={user}
            haveNewNotification={this.state.haveNewNotification}
          />
        </Animatable.View>
        <Animatable.View
          duration={50}
          animation={animationDow}
          style={styles.contents}
        >
          <ScrollView vertical>
            <Pages
              containerStyle={styles.pagesContainer}
              width={width}
              startPage={
                parseInt(this.props.user.default_page) || PAGE_NUMBER_DEFAULT
              }
            >
              {/* SWIPE LEFT */}
              <CheckIn
                user={this.props.user}
                onPress={() => {
                  this.openCamera();
                }}
              />
              {/* DEFAULT PAGE */}
              <Feeds user={this.props.user} />
              {/* SWIPE RIGHT */}
              <Orders {...this.props} />
            </Pages>
          </ScrollView>
        </Animatable.View>
        <Modal
          position={'bottom'}
          swipeArea={50}
          keyboardTopOffset={0}
          isOpen={isModalVisible}
          style={[
            styles.styleModal,
            {
              marginTop: Platform.OS === 'android' ? 4 : null
            }
          ]}
          backdrop
          ref={modal => {
            this.modal = modal;
          }}
        >
          {this.showModal()}
        </Modal>
      </View>
    );
  }
}

const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(Home);
