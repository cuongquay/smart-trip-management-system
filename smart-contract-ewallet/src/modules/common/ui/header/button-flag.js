import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

// create a component
export const ButtonFlag = ({ country = 'vi', onPress }) => {
  let countryFlag = require('assets/flags/vi.png');

  switch (country) {
    case 'vi':
      countryFlag = require('assets/flags/vi.png');
      break;

    case 'en':
      countryFlag = require('assets/flags/en.png');
      break;

    default:
      countryFlag = require('assets/flags/vi.png');
      break;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        style={{ width: 28 }}
        resizeMode="contain"
        source={countryFlag}
        defaultSource={countryFlag}
      />
    </TouchableOpacity>
  );
};
