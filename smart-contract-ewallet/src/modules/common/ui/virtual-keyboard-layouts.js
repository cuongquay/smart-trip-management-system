import {
  scale /*eslint-disable-line no-unused-vars*/,
  verticalScale /*eslint-disable-line no-unused-vars*/,
  moderateScale /*eslint-disable-line no-unused-vars*/
} from 'react-native-size-matters';

const DefaultSpecialCodes = [
  'finger-print',
  'qr-scanner',
  'arrow-dropdown',
  'arrow-dropup',
  'backspace',
  'contact',
  'keypad',
  'camera',
  'repeat',
  'people',
  'trash',
  'flash',
  'apps',
  'more'
];

const NumericOnlyLayout = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ['', 0, 'backspace']
];

const FlashNumericLayout = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ['flash', 0, 'backspace']
];

const ExtendedNumericLayout = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ['more', 0, 'backspace']
];

const QwertyNumericLayout = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [{ code: 'abc', buttonStyle: { borderWidth: 0 } }, 0, 'backspace']
];

/*eslint-disable no-unused-vars*/
const ExtendedPhoneLayout = [
  ['091', '092', '093'],
  ['094', '095', '096'],
  ['097', '098', '099'],
  ['keypad', '0168', 'flash']
];

/*eslint-disable no-unused-vars*/
const ExtendedCurrencyLayout = [
  ['100', '200', '300'],
  ['400', '500', '600'],
  ['700', '800', '900'],
  ['keypad', '000', 'flash']
];

/*eslint-disable no-unused-vars*/
const AlphabetUpperCaseLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  [
    { code: 'arrow-dropdown', buttonStyle: { width: scale(50) } },
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    { code: 'backspace', buttonStyle: { width: scale(50) } }
  ],
  [
    { code: '123', buttonStyle: { width: scale(40), borderWidth: 0 } },
    '!',
    '$',
    '%',
    '^',
    '&',
    '*',
    '-',
    '/',
    'flash'
  ]
];

/*eslint-disable no-unused-vars*/
const AlphabetLowerCaseLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  [
    { code: 'arrow-dropup', buttonStyle: { width: scale(50) } },
    'z',
    'x',
    'c',
    'v',
    'b',
    'n',
    'm',
    { code: 'backspace', buttonStyle: { width: scale(50) } }
  ],
  [
    { code: '123', buttonStyle: { width: scale(40), borderWidth: 0 } },
    '#',
    '@',
    {
      code: 'space',
      buttonStyle: { width: scale(120) },
      textStyle: { fontSize: scale(12) }
    },
    { code: '.vn', buttonStyle: { width: scale(40), borderWidth: 0 } },
    { code: '.com', buttonStyle: { width: scale(50), borderWidth: 0 } }
  ]
];

const VirtualKeyboardTypes = {
  ALPHA_NUMERIC: 'ALPHANUMERIC',
  FLASH_NUMERIC: 'FLASHNUMERIC',
  EXTENDED_PHONE: 'EXTENDEDPHONE',
  EXTENDED_CURRENCY: 'EXTENDEDCURRENCY',
  EXTENDED_NUMERIC: 'EXTENDEDNUMERIC',
  QWERTY_KEYBOARD: 'QWERTYKEYBOARD',
  QWERTY_NUMERIC: 'QWERTYNUMERIC',
  NUMERIC_ONLY: 'NUMERICONLY'
};

export {
  DefaultSpecialCodes,
  VirtualKeyboardTypes,
  NumericOnlyLayout,
  FlashNumericLayout,
  QwertyNumericLayout,
  ExtendedNumericLayout,
  ExtendedPhoneLayout,
  ExtendedCurrencyLayout,
  AlphabetLowerCaseLayout,
  AlphabetUpperCaseLayout
};
