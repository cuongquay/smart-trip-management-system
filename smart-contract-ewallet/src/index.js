import React, { Component } from 'react';
import { DeviceEventEmitter, View, AppState, Platform } from 'react-native';
import { Provider } from 'react-redux';
import moment from 'moment';
import SplashScreen from 'react-native-splash-screen';
import OneSignal from 'react-native-onesignal';
import DeviceInfo from 'react-native-device-info';
import { PersistGate } from 'redux-persist/es/integration/react';
import { reset } from 'actions/actions-navigation';
import { setLoading } from 'actions/actions-common';
import {
  requestUserBalance,
  clearUserAuth,
  requestBadgeStatus
} from 'actions/actions-user';
import RootContainer from 'screens';
import { configureStore } from 'stores';
import { setToken } from 'apis';
import { DeviceTypes, switchLanguage } from 'common';
import { cacheDeviceInfo } from 'utilities';

const { store, persistor } = configureStore();
export { store };

class App extends Component {
  componentDidMount() {
    this.deviceInfo = {
      device_model: DeviceInfo.getModel(),
      device_os: DeviceInfo.getSystemVersion(),
      device_type:
        Platform.OS === 'ios' ? DeviceTypes.IOS : DeviceTypes.ANDROID,
      identifier: 'Test Device',
      notify_id: 'Test Device'
    };
    cacheDeviceInfo(this.deviceInfo);

    // Notification listener:
    OneSignal.inFocusDisplaying(2);
    OneSignal.addEventListener('opened', notificationData => {
      DeviceEventEmitter.once('PERSIST', () => {
        store.dispatch(setLoading(false));
        AppState.addEventListener('change', this.handleAppStateChange);
        // If it's not due date, redirect to main page:
        this.onOpen(notificationData);
      });
    });

    OneSignal.addEventListener('ids', device => {
      console.log(device);
      this.deviceInfo = {
        ...this.deviceInfo,
        identifier: device ? device.pushToken : 'Test Device',
        notify_id: device ? device.userId : 'Test Device'
      };
      cacheDeviceInfo(this.deviceInfo);
    });

    AppState.addEventListener('change', this.handleAppStateChange);
    OneSignal.addEventListener('opened', notificationData =>
      this.onOpen(notificationData)
    );
    setTimeout(() => SplashScreen.hide(), 3000);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change');
    OneSignal.removeEventListener('ids');
    OneSignal.removeEventListener('received');
    OneSignal.removeEventListener('opened');
  }

  onBeforeLift() {
    const { user, config } = store.getState();
    console.log(user);
    setTimeout(() => SplashScreen.hide(), 3000);
    switchLanguage(config.language);
    store.dispatch(setLoading(false));
    // If it's not due date, redirect to main page:
    //__DEV__ && store.dispatch(reset(['PasscodeRecoverySetupScreen']));
    if (
      user &&
      user.token &&
      user.id &&
      moment.unix(user.expired_at).isAfter(new Date())
    ) {
      // Reload user token into API cache:
      setToken(user.token);
      return store.dispatch(reset(['HomeScreen']));
    } else if (user && !user.token) {
      // Nếu không có token => Phiên làm việc đã hết hạn.
      return store.dispatch(reset(['PasscodeWelcomeBackScreen']));
    } else if (user && !user.id) {
      return store.dispatch(reset(['PasscodeScreen']));
    } else {
      return store.dispatch(reset(['PasscodeScreen']));
    }
  }

  handleAppStateChange = nextAppState => {
    const { user, navState } = store.getState();
    if (nextAppState === 'active') {
      // Check if root screen is HomeTab.
      if (navState.routes[0].routeName === 'HomeScreen') {
        // If token expires:
        if (user && !moment.unix(user.expired_at).isAfter(new Date())) {
          store.dispatch(clearUserAuth());
          store.dispatch(reset(['PasscodeWelcomeBackScreen']));
        } else {
          return;
        }
      }
    }
  };

  onOpen(notificationData) {
    const { user } = store.getState();
    // If it's not due date, redirect to main page:
    if (user && moment.unix(user.expired_at).isAfter(new Date())) {
      if (
        notificationData.notification.payload.hasOwnProperty('additionalData')
      ) {
        const {
          action,
          url
        } = notificationData.notification.payload.additionalData;

        if (action === 'url')
          store.dispatch(reset(['HomeScreen', 'WebviewScreen'], url, 1));
        else {
          switch (action) {
            case 'PaymentHistoryScreen':
              store.dispatch(reset(['HomeScreen'], true));
              break;
            case 'HomeTabNavigator':
              store.dispatch(reset(['HomeScreen']));
              break;
            default:
              store.dispatch(reset(['HomeScreen', action], null, 1));
          }
        }
      } else {
        store.dispatch(reset(['HomeScreen']));
      }

      // Reload user token into API cache:
      setToken(user.token);
      // Update user balance:
      store.dispatch(requestUserBalance());
      store.dispatch(requestBadgeStatus());
      return;
    }

    // If expired, clear user data.
    store.dispatch(reset(['PasscodeScreen']));
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          loading={<View />}
          onBeforeLift={() => this.onBeforeLift()}
        >
          <RootContainer />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
