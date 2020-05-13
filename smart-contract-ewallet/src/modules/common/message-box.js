import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { I18n } from 'common';
import { Colors, Text } from 'common/ui';

const MessageButton = ({ onPress, actions, type, actionText, buttonStyle }) => {
  if (actions.indexOf(type.toUpperCase()) !== -1) {
    return (
      <TouchableOpacity
        style={[
          styles.buttonDialog,
          type.toUpperCase() === 'CANCEL'
            ? { backgroundColor: Colors.GREYISH_BROWN }
            : { backgroundColor: Colors.BLACK },
          buttonStyle
        ]}
        onPress={onPress}
      >
        <Text
          style={{
            color: Colors.WHITE,
            fontSize: 17
          }}
        >
          {actionText ? actionText : I18n.t('message.' + type.toLowerCase())}
        </Text>
      </TouchableOpacity>
    );
  } else {
    return null;
  }
};

const MessageBox = ({
  title,
  message,
  actions,
  acceptText,
  cancelText,
  onClose,
  onCancel
}) => {
  return (
    <View style={styles.containerDialog}>
      <Text style={[styles.text, styles.title]}>{title}</Text>
      <View style={styles.messageContent}>
        <Text style={styles.text}>{message}</Text>
      </View>
      <View style={styles.buttonWrapper}>
        <MessageButton
          actions={actions}
          onPress={onCancel}
          type={'CANCEL'}
          actionText={cancelText}
          buttonStyle={
            actions.indexOf('ACCEPT') !== -1
              ? {
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 0
                }
              : {
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4
                }
          }
        />
        <MessageButton
          actions={actions}
          onPress={onClose}
          type={'ACCEPT'}
          actionText={acceptText}
          buttonStyle={
            actions.indexOf('CANCEL') !== -1
              ? {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 4
                }
              : {
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4
                }
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerDialog: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4
  },
  messageContent: {
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 0
  },
  buttonWrapper: {
    flexDirection: 'row',
    width: '100%'
  },
  buttonDialog: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  title: {
    fontWeight: '500',
    marginBottom: 0,
    marginTop: 15
  },
  text: {
    fontSize: 15,
    color: 'rgb(47,54,66)',
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default MessageBox;
