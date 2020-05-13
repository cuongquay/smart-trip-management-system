import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

const ButtonClose = props => {
  const { onPress } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'transparent',
        paddingLeft: 20
      }}
    >
      <Icon
        containerStyle={{
          backgroundColor: 'transparent',
          marginRight: -3,
          flex: 1,
          alignItems: 'flex-end'
        }}
        type="material-community"
        name="close"
        size={27}
      />
    </TouchableOpacity>
  );
};

export { ButtonClose };
