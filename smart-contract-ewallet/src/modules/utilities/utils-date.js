import moment from 'moment';
import { Alert, Platform, DatePickerAndroid } from 'react-native';
import { Colors, I18n } from 'common';
import DateTimePicker from 'common/ui/date-picker';

const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function pickDateTime(format: string = DEFAULT_FORMAT) {
  return new Promise((resolve, reject) => {
    DateTimePicker.show({
      titleBgColor: Colors.GRAY_BACKGROUND,
      datePickerMode: Platform.OS === 'ios' ? 'date' : 'date',
      dayText: 'd',
      monthText: 'm',
      yearText: '',
      hoursText: 'h',
      minutesText: 'm',
      secondsText: 's',
      titleText: 'Date de sélection',
      doneText: 'OK',
      cancelText: 'Annuler',
      onPickerConfirm: selectedDate => {
        if (format === 'timestamp') {
          resolve(moment(selectedDate, 'YYYY-MM-DD HH:mm:ss').unix());
        } else {
          resolve(moment(selectedDate, 'YYYY-MM-DD HH:mm:ss').format(format));
        }
      },
      onPickerCancel: () => {
        reject(false);
      },
      onPickerDidSelect: selectedDate => {
        console.log(selectedDate);
      }
    });
  });
}

export async function pickBirthday(ageLimit: number = 5) {
  const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  let selectedDate = moment().format(DATE_FORMAT);
  if (Platform.OS === 'ios') {
    return new Promise((resolve, reject) => {
      DateTimePicker.show({
        datePickerMode: 'date',
        titleText: 'Chọn ngày sinh',
        doneText: 'Chọn',
        doneTextColor: Colors.BLACK,
        selectedDate: selectedDate,
        titleBgColor: Colors.GRAY_BACKGROUND,
        maximumDate: moment()
          .subtract(ageLimit, 'years')
          .format(DATE_FORMAT),
        onPickerConfirm: selectedDate => {
          const chosenDate = moment(selectedDate, 'YYYY-MM-DD').toDate();
          if (new Date().getFullYear() - chosenDate.getFullYear() < ageLimit) {
            setTimeout(() => {
              Alert.alert(
                I18n.t('edit_profile.title'),
                I18n.t('edit_profile.age_restriction'),
                [
                  {
                    text: I18n.t('common.cancel'),
                    onPress: () => console.log('Cancel'),
                    style: 'cancel'
                  },
                  {
                    text: I18n.t('common.ok'),
                    onPress: () => () => console.log('OK')
                  }
                ],
                {
                  cancelable: false
                }
              );
            }, 1000);
          } else {
            const res = {
              day: chosenDate.getUTCDate(),
              month: chosenDate.getMonth() + 1,
              year: chosenDate.getFullYear()
            };
            resolve(res);
          }
        },
        onPickerCancel: () => {
          reject();
        },
        onPickerDidSelect: selectedData => {
          console.log(selectedData);
        }
      });
    });
  } else {
    return new Promise(async (resolve, reject) => {
      try {
        const mm = moment().subtract(ageLimit, 'years');
        const maxYear = mm.get('year');
        const maxMonth = mm.get('month');
        const maxDate = mm.get('date');
        const { action, year, month, day } = await DatePickerAndroid.open({
          // Use `new Date()` for current date.
          // May 25 2020. Month 0 is January.
          date: new Date(maxYear, maxMonth, maxDate),
          maxDate: new Date(maxYear, maxMonth, maxDate),
          mode: 'calendar'
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          // Selected year, month (0-11), day
          resolve({
            day,
            month: month + 1,
            year
          });
        }
      } catch ({ code, message }) {
        console.warn('Cannot open date picker', message);
        reject();
      }
    });
  }
}
