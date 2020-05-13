/* @flow */

/**
 * Date Picker iOS and Android.
 * Android alternative: https://github.com/Gericop/DateTimePicker
 */
'use strict';

import {
  NativeModules,
  processColor,
  Platform,
  NativeEventEmitter
} from 'react-native';
import moment from 'moment';
import Colors from './colors';

const { RNKitASDatePicker, RNDateTimeChooser } = NativeModules;

const nativeEventEmitter = new NativeEventEmitter(RNKitASDatePicker);

let listener = null;

const extraArgs = {
  dayText: 'd',
  monthText: 'm',
  yearText: '',
  hoursText: 'h',
  minutesText: 'm',
  secondsText: 's'
};

const datePickerDefaultArgs = {
  titleText: 'Date',
  titleTextColor: '#393939',
  doneText: 'Oui',
  doneTextColor: Colors.GRAY_BACKGROUND,
  cancelText: 'Non',
  cancelTextColor: Colors.GRAY_BACKGROUND,
  minimumDate: moment().format('YYYY-MM-DD HH:mm:ss'),
  maximumDate: '2222-12-12 23:59:59',
  datePickerMode: 'date'
};

const DatePicker = {
  show: args => {
    const options = { ...extraArgs, ...datePickerDefaultArgs, ...args };
    const params = {
      ...options,
      titleTextColor: processColor(options.titleTextColor),
      doneTextColor: processColor(options.doneTextColor),
      cancelTextColor: processColor(options.cancelTextColor),
      wheelBgColor: processColor(options.wheelBgColor),
      titleBgColor: processColor(options.titleBgColor),
      outTextColor: processColor(options.outTextColor),
      centerTextColor: processColor(options.centerTextColor),
      dividerColor: processColor(options.dividerColor),
      shadeBgColor: processColor(options.shadeBgColor)
    };
    try {
      RNKitASDatePicker.showWithArgs(params, resp => {
        if (resp.type === 'done') {
          options.onPickerConfirm && options.onPickerConfirm(resp.selectedDate);
        } else {
          options.onPickerCancel && options.onPickerCancel();
        }
      });
      listener && listener.remove();
      listener = nativeEventEmitter.addListener('DatePickerEvent', event => {
        options.onPickerDidSelect &&
          options.onPickerDidSelect(event.selectedDate);
      });
    } catch (e) {
      console.log(e);
      listener && listener.remove();
      options.onPickerCancel && options.onPickerCancel();
      return;
    }
  }
};

let DatePickerAndroid = {
  show: args => {
    RNDateTimeChooser.show(
      {
        ...args
      },
      resp => {
        if (resp.type === 'done') {
          args.onPickerConfirm && args.onPickerConfirm(resp.selectedDate);
        } else {
          args.onPickerCancel && args.onPickerCancel();
        }
      }
    );
  }
};

export default (Platform.OS === 'ios' ? DatePicker : DatePickerAndroid);
