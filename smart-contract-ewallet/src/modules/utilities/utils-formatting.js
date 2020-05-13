/**
 * @flow
 * Format lại số điện thoại và mệnh giá sao cho dễ nhìn.
 */

export const phoneNumberFormat = (phoneNumber: string) => {
  if (!phoneNumber) return '';
  if (phoneNumber.length === 10) {
    return (
      phoneNumber.slice(0, 4) +
      ' ' +
      phoneNumber.slice(4, 7) +
      ' ' +
      phoneNumber.slice(7, 10)
    );
  }

  return (
    phoneNumber.slice(0, 4) +
    ' ' +
    phoneNumber.slice(4, 7) +
    ' ' +
    phoneNumber.slice(7, 11)
  );
};
export const phoneNumberFormatInFocus = (phoneNumber: string) => {
  if (!phoneNumber) return '';
  if (phoneNumber.length >= 4 && phoneNumber.length < 7) {
    phoneNumber =
      phoneNumber.slice(0, 4) + ' ' + phoneNumber.slice(4, phoneNumber.length);
  } else if (phoneNumber.length >= 7) {
    phoneNumber =
      phoneNumber.slice(0, 4) +
      ' ' +
      phoneNumber.slice(4, 7) +
      ' ' +
      phoneNumber.slice(7, phoneNumber.length);
  }
  return phoneNumber;
};
// External: I18n.toNumber('2000044', {delimiter: ".", separator: ",", precision: 0})
export const currencyFormat = amount => {
  if (!amount) return 0;
  amount = String(amount).replace(/\D+/g, '');
  return String(amount).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
};

export const getNumberOnly = number => {
  if (!number) return 0;
  return String(number).replace(/\D+/g, '');
};

export const formatServiceName = name => {
  let arrName = name.split(' | ');
  let newName = arrName[0];
  for (var i = 1; i < arrName.length; i++) {
    newName = newName + '\n' + arrName[i];
  }
  return newName;
};
export const formatName = name => {
  if (name.length > 15) return name.substring(0, 15) + '...';
  return name;
};
