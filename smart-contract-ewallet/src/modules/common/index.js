'use strict';

import {
  setCustomText,
  setCustomTouchableOpacity,
  setCustomTextInput
} from 'react-native-global-props';
import { DeviceEventEmitter } from 'react-native';
import { I18n, switchLanguage } from 'localizations';
import { Events } from './events';
import ToastManager from './toast-manager';
import MessageBox from './message-box';
import ModalManager from './modal-manager';
import setLoadingView from './loading-view';

const AnimationKeys = {
  OUT_UP: 'fadeOutUp',
  OUT_DOWN: 'fadeOutDown',
  IN_UP: 'fadeInUp',
  IN_DOWN: 'fadeInDown',
  FADE_OUT: 'fadeOut',
  FADE_IN: 'fadeIn'
};

const SettingBrowseUrl = {
  voted: {
    id: 1,
    AndroidUrl:
      'https://play.google.com/store/apps/details?id=com.tripcontract.mobile',
    IOSUrl:
      'https://play.google.com/store/apps/details?id=com.tripcontract.mobile'
  },
  facebook: {
    id: 2,
    url: 'https://www.facebook.com/tripcontract/'
  },
  website: {
    id: 3,
    url: 'https://tripcontract.com/'
  },
  rules: {
    id: 4,
    url: 'https://tripcontract.com/dieu-khoan/'
  }
};

const DeviceTypes = {
  ANDROID: 1,
  IOS: 0
};

// OVERIDDED: Set all text to new font.
setCustomText({
  style: {
    fontFamily: 'Averta-Regular'
  }
});

// OVERIDDED: TouchableOpacity's active opacity to 0.7
setCustomTouchableOpacity({
  activeOpacity: 0.7
});

// OVERIDDED: Set all input text to new font.
setCustomTextInput({
  selectionColor: '#525252',
  style: {
    fontFamily: 'Averta-SemiBold'
  }
});

function toggleDrawer() {
  DeviceEventEmitter.emit('DRAWER_TOGGLE');
}

export {
  DeviceTypes,
  SettingBrowseUrl,
  AnimationKeys,
  I18n,
  switchLanguage,
  Events,
  ToastManager,
  MessageBox,
  ModalManager,
  setLoadingView,
  toggleDrawer
};
