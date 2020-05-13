'use strict';

import React from 'react';
import { TouchableOpacity } from 'react-native';

const ButtonBlank = props => {
  const { onPress } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          marginHorizontal: 8,
          width: 26,
          height: 24,
          backgroundColor: 'transparent'
        },
        props.style
      ]}
    />
  );
};

export { ButtonBlank };
