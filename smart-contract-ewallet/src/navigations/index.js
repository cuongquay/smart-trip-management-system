/**
 * @flow
 * Navigator chính của app.
 */

'use strict';

import { StackNavigator } from 'react-navigation';
import { Colors } from 'common/ui';
import { PixelRatio, Platform, Dimensions } from 'react-native';

import Home from '../screens/home';
import Passcode from '../screens/login/passcode';
import PasscodeWelcomeBack from '../screens/login/passcode-welcome';
import PasscodeConfirmation from '../screens/login/passcode-confirmation';
import PasscodeLock from '../screens/login/passcode-lock';
import PasscodeRecoverySetup from '../screens/login/passcode-recovery-setup';
import PasscodeRecovery from '../screens/login/passcode-recovery';
import PasscodeSetup from '../screens/login/passcode-setup';
import PasscodeChange from '../screens/login/passcode-change';
import AccountLocked from '../screens/login/account-locked';
import QRScanning from '../screens/home/qr-scanning';
import TOSScr from '../screens/login/tos';
import Webview from '../screens/login/webview';
import Profile from '../screens/login/profile';
import ChangeLanguage from '../screens/login/change-language';
import TransactionHistory from '../screens/history';
import TransactionHistoryDetail from '../screens/history/details';
import OrderItemDetails from 'orders/details';
import EditInfo from '../screens/settings/edit-info-user';
import SettingApplication from '../screens/settings';
import RestorePassWord from '../screens/settings/restore-password';
import InfoApp from '../screens/settings/info-app';
import MoneyManagement from '../screens/settings/money-management';
import NotificationHistoryV3 from '../screens/settings/notification-history-v3';

const routeConfig = {
  HomeScreen: { screen: Home },
  PasscodeScreen: { screen: Passcode },
  PasscodeWelcomeBackScreen: { screen: PasscodeWelcomeBack },
  PasscodeConfirmationScreen: { screen: PasscodeConfirmation },
  PasscodeLockScreen: { screen: PasscodeLock },
  PasscodeRecoverySetupScreen: { screen: PasscodeRecoverySetup },
  PasscodeRecoveryScreen: { screen: PasscodeRecovery },
  PasscodeSetupScreen: { screen: PasscodeSetup },
  PasscodeChangeScreen: { screen: PasscodeChange },
  AccountLockedScreen: { screen: AccountLocked },
  QRScreen: { screen: QRScanning },
  WebviewScreen: { screen: Webview },
  ProfileScreen: { screen: Profile },
  TransactionHistoryScreen: { screen: TransactionHistory },
  TransactionHistoryDetailScreen: { screen: TransactionHistoryDetail },
  OrderItemDetailsScreen: { screen: OrderItemDetails },
  EditInfoScreen: { screen: EditInfo },
  SettingApplicationScreen: { screen: SettingApplication },
  ChangeLanguageScreen: { screen: ChangeLanguage },
  RestorePassWordScreen: { screen: RestorePassWord },
  InfoAppScreen: { screen: InfoApp },
  MoneyManagementScreen: { screen: MoneyManagement },
  NotificationHistoryV3Screen: { screen: NotificationHistoryV3 },
  TOSScreen: { screen: TOSScr }
};

const extraHeaderConfig =
  PixelRatio.get() <= 2 && Platform.OS === 'ios'
    ? {
        minWidth: 800
      }
    : {};

const { width } = Dimensions.get('window');

const stackNavigatorConfig = {
  initialRouteName: 'HomeScreen',
  mode: 'card',
  navigationOptions: {
    gesturesEnabled: false,
    headerTintColor: Colors.BLACK,
    headerBackTitle: '',
    headerStyle: {
      backgroundColor: Colors.WHITE,
      borderWidth: 0,
      borderBottomColor: 'transparent',
      shadowColor: 'transparent',
      elevation: 0,
      shadowRadius: 0,
      shadowOffset: {
        height: 0
      }
    },
    headerTitleStyle: {
      alignSelf: 'center',
      width: width * 0.86,
      textAlign: 'center',
      fontFamily: 'Averta-SemiBold',
      fontWeight: '600',
      fontSize: 19,
      ...extraHeaderConfig
    }
  }
};

const AppNavigator = StackNavigator(routeConfig, stackNavigatorConfig);

export default AppNavigator;
