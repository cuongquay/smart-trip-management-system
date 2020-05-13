import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';
import md5 from 'md5';
import { pickDateTime, pickBirthday } from './utils-date';
import { getExceptionMessage } from './utils-exceptions';

import {
  isDigitOnly,
  validateEmail,
  isSpecialCharactors,
  hasNumber,
  validatePhoneNumber,
  getNetworkOperator,
  getNetworkOperatorLength
} from './utils-validation';
import {
  phoneNumberFormat,
  phoneNumberFormatInFocus,
  currencyFormat,
  getNumberOnly,
  formatServiceName,
  formatName
} from './utils-formatting';
import geolib from 'geolib';

const getDistance = (latitude1, longitude1, latitude2, longitude2) => {
  let distance = geolib.getDistanceSimple(
    {
      latitude: latitude1,
      longitude: longitude1
    },
    {
      latitude: latitude2,
      longitude: longitude2
    }
  );

  distance = geolib.convertUnit('km', distance, 2);

  const result = {
    originalValue: distance,
    value: distance < 1 ? distance * 1000 : distance,
    unit: distance < 1 ? 'm' : 'km'
  };

  return result;
};

let deviceInfo = null;

function cacheDeviceInfo(data) {
  deviceInfo = data;
}

function getCachedDeviceInfo() {
  return deviceInfo;
}

function qrAlgorithm(phoneNumber: string, deviceId: string, passcode: string) {
  return md5(phoneNumber + ':' + deviceId + ':' + passcode);
}
const getImageFromServiceName = {
  DEFAULT_ICON: {
    url: require('assets/home/billing.png'),
    modalShow: 0
  }
};
const tracker = new GoogleAnalyticsTracker('UA-00000000-0');

export {
  tracker,
  isDigitOnly,
  validateEmail,
  isSpecialCharactors,
  hasNumber,
  validatePhoneNumber,
  getNetworkOperator,
  getNetworkOperatorLength,
  getDistance,
  pickDateTime,
  pickBirthday,
  qrAlgorithm,
  getCachedDeviceInfo,
  getImageFromServiceName,
  cacheDeviceInfo,
  getExceptionMessage,
  phoneNumberFormat,
  phoneNumberFormatInFocus,
  currencyFormat,
  getNumberOnly,
  formatServiceName,
  formatName
};
