const networkOperators = {
  '096': ['Viettel', 10],
  '097': ['Viettel', 10],
  '098': ['Viettel', 10],
  '086': ['Viettel', 10],
  '0162': ['Viettel', 11],
  '0163': ['Viettel', 11],
  '0164': ['Viettel', 11],
  '0165': ['Viettel', 11],
  '0166': ['Viettel', 11],
  '0167': ['Viettel', 11],
  '0168': ['Viettel', 11],
  '0169': ['Viettel', 11],

  '090': ['Mobifone', 10],
  '093': ['Mobifone', 10],
  '089': ['Mobifone', 10],
  '0120': ['Mobifone', 11],
  '0121': ['Mobifone', 11],
  '0122': ['Mobifone', 11],
  '0126': ['Mobifone', 11],
  '0128': ['Mobifone', 11],

  '091': ['Vinaphone', 10],
  '094': ['Vinaphone', 10],
  '088': ['Vinaphone', 10],
  '0123': ['Vinaphone', 11],
  '0124': ['Vinaphone', 11],
  '0125': ['Vinaphone', 11],
  '0127': ['Vinaphone', 11],
  '0129': ['Vinaphone', 11],

  '099': ['Gmobile', 10],
  '0199': ['Gmobile', 11],

  '092': ['Vietnamobile', 10],
  '0186': ['Vietnamobile', 11],
  '0188': ['Vietnamobile', 11]
};

export const isDigitOnly = input => {
  if (input === ' ') return false;
  return /^(\s*|\d+)$/.test(input);
};

export const validateEmail = email => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9-]+\.[.A-Z]{2,24}$/i.test(email);
};

export const isSpecialCharactors = input => {
  if (input === ' ') return false;
  return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(input);
};

export const hasNumber = myString => {
  return /\d/.test(myString);
};

export const validatePhoneNumber = phoneNumber => {
  return RegExp(
    '^(012[0-9]{1}|016[2-9]{1}|018[6|8]{1}|0199|09[0-9]{1}|08[6|8|9])[0-9]{7}$'
  ).test(phoneNumber);
};

export const getNetworkOperator = phoneNumber => {
  const result = RegExp(
    '^(012[0-9]{1}|016[2-9]{1}|018[6|8]{1}|0199|09[0-9]{1}|08[6|8|9])[0-9]{7}$'
  ).exec(phoneNumber);
  return result && result.length == 2 ? networkOperators[result[1]][0] : null;
};

export const getNetworkOperatorLength = phoneNumber => {
  const result = RegExp(
    '^(012[0-9]{1}|016[2-9]{1}|018[6|8]{1}|0199|09[0-9]{1}|08[6|8|9])[0-9]{7}$'
  ).exec(phoneNumber);
  return result && result.length == 2 ? networkOperators[result[1]][1] : -1;
};
