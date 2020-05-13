import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import { connect } from 'react-redux';
import Communications from 'react-native-communications';
import {
  I18n,
  toggleDrawer,
  ToastManager,
  MessageBox,
  ModalManager
} from 'common';
import { Colors, Text } from 'common/ui';
import { getExceptionMessage } from 'utilities';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import ImagePicker from 'react-native-image-picker';
import { navigate, reset } from 'actions/actions-navigation';
import { apiAuthenticate } from 'apis/api-authenticate';
import { apiProfile } from 'apis/api-profile';
import { setLoading } from 'actions/actions-common';
import { updateUserData, clearUserSession } from 'actions/actions-user';
const { width, height } = Dimensions.get('window');

class SideBarMenu extends Component {
  async logout() {
    const { dispatch } = this.props;
    toggleDrawer();
    ModalManager.dismiss();
    try {
      const resp = await apiAuthenticate.logout();
      dispatch(reset(['PasscodeScreen']));
      dispatch(clearUserSession());
      console.log(resp);
    } catch (error) {
      console.log(error);
      const { title, message } = getExceptionMessage('NoInternetConnection');
      ToastManager.show(title, message);
    }
  }

  menuSection = () => {
    const { dispatch, user } = this.props;
    return [
      {
        name: I18n.t('drawer.user_info'),
        icon: require('assets/home/info.png'),
        action: () => {
          dispatch(navigate('ProfileScreen', { user }));
          toggleDrawer();
        }
      },
      {
        name: I18n.t('drawer.transaction_history'),
        icon: require('assets/home/support.png'),
        count: 0,
        action: () => {
          dispatch(navigate('TransactionHistoryScreen'));
          toggleDrawer();
        }
      },
      {
        name: I18n.t('drawer.money_management'),
        icon: require('assets/home/support.png'),
        action: () => {
          dispatch(navigate('MoneyManagementScreen'));
          toggleDrawer();
        }
      },
      {
        name: I18n.t('drawer.support'),
        icon: require('assets/home/support.png'),
        action: () => {
          toggleDrawer();
          ModalManager.show(
            <MessageBox
              title={I18n.t('message.support.title')}
              message={I18n.t('message.support.description')}
              actions={'ACCEPT|CANCEL'}
              acceptText={I18n.t('message.support.action')}
              onCancel={ModalManager.dismiss}
              onClose={() => {
                const phone = '1800 6751';
                const isIOS = Platform.OS === 'ios' ? true : false;
                Communications.phonecall(phone, isIOS);
              }}
            />
          );
        }
      },
      {
        name: I18n.t('drawer.settings'),
        icon: require('assets/home/setting.png'),
        size: {
          width: 33,
          height: 40
        },
        action: () => {
          dispatch(
            navigate('SettingApplicationScreen', {
              dispatch: dispatch,
              user: user
            })
          );
          toggleDrawer();
        }
      },
      {
        name: I18n.t('drawer.logout'),
        icon: require('assets/home/icon-logout.png'),
        action: () => {
          ModalManager.show(
            <MessageBox
              title={I18n.t('message.logout.title')}
              message={I18n.t('message.logout.confirmation')}
              actions={'ACCEPT|CANCEL'}
              acceptText={I18n.t('message.logout.action')}
              onCancel={() => ModalManager.dismiss()}
              onClose={() => {
                this.logout();
              }}
            />
          );
        }
      }
    ];
  };

  async onSelectAvatar() {
    var options = {
      maxWidth: 400,
      title: I18n.t('profile.select_photo'),
      takePhotoButtonTitle: I18n.t('profile.take_photo'),
      chooseFromLibraryButtonTitle: I18n.t('profile.select_photo_from_library'),
      cancelButtonTitle: I18n.t('common.cancel')
      // Open Image Library:
    };
    try {
      ImagePicker.showImagePicker(options, async response => {
        console.log(response);
        if (response.uri) {
          const { dispatch, user } = this.props;
          let imgData = new FormData();
          imgData.append('image', {
            uri: response.uri,
            type: response.type || 'image/jpeg',
            name: response.fileName || 'avatar.jpg'
          });

          const resp = await apiProfile.uploadImage(user.id, imgData);
          console.log(resp);
          if (resp.code) {
            throw resp;
          }

          const profileResp = await apiProfile.update(user.id, resp.url);
          console.log(profileResp);
          if (profileResp.code) {
            throw profileResp;
          }

          dispatch(updateUserData(profileResp));
          dispatch(setLoading(false));
        }
      });
    } catch (e) {
      console.log(e);
      const { title, message } = getExceptionMessage(e.code);
      return ToastManager.show(title, message);
    }
  }

  render() {
    const { user } = this.props;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            this.onSelectAvatar();
          }}
        >
          <ImageBackground
            style={styles.avatarWrapper}
            source={require('assets/home/bg-avatar.png')}
          >
            <Image
              style={styles.imageAvatar}
              source={
                user && user.avatar_img
                  ? {
                      uri: user.avatar_img
                    }
                  : require('assets/home/avatar_default.png')
              }
            />{' '}
            <Text
              style={{
                color: Colors.WHITE,
                fontSize: 16,
                textAlign: 'center'
              }}
            >
              {' '}
              {user ? user.full_name : ''}{' '}
            </Text>{' '}
          </ImageBackground>{' '}
        </TouchableOpacity>{' '}
        <ScrollView style={styles.scrollView}>
          {' '}
          {this.menuSection().map(value => {
            return (
              <TouchableOpacity
                key={Math.random()}
                onPress={value.action}
                style={styles.imageItem}
              >
                {' '}
                {value.name === I18n.t('drawer.logout') ? (
                  <View style={styles.lastItem}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginBottom: 15
                      }}
                    >
                      <Image
                        source={value.icon}
                        style={{
                          height: 16,
                          width: 13,
                          marginRight: 10
                        }}
                      />{' '}
                      <Text
                        style={[
                          styles.name,
                          {
                            color: Colors.RED
                          }
                        ]}
                      >
                        {' '}
                        {value.name}{' '}
                      </Text>{' '}
                    </View>{' '}
                    <Text
                      style={{
                        color: Colors.BLACK,
                        fontSize: 10
                      }}
                    >
                      {' '}
                      {I18n.t('drawer.version') + ' v2.1.0.1.2 (101010)'}{' '}
                    </Text>{' '}
                  </View>
                ) : (
                  <View style={styles.normalItem}>
                    <Image
                      style={styles.icon}
                      resizeMode="contain"
                      source={value.icon}
                    />
                    <Text style={styles.name}>{value.name}</Text>{' '}
                  </View>
                )}{' '}
              </TouchableOpacity>
            );
          })}{' '}
        </ScrollView>{' '}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avatarWrapper: {
    height: height / 4.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1
  },
  container: {
    width: 0.95 / 2 * width,
    marginTop: Platform.OS == 'ios' ? 0 : 20,
    flex: 1
  },
  imageItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height / 6,
    borderColor: 'rgb(193,199,208)',
    borderBottomWidth: 1
  },
  icon: {
    height: verticalScale(40),
    marginBottom: 10
  },
  imageAvatar: {
    width: 64,
    height: 64,
    marginBottom: 5,
    borderRadius: 32
  },
  lastItem: {
    marginLeft: moderateScale(50, 1.5),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%'
  },
  normalItem: {
    marginLeft: moderateScale(50, 1.5),
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%'
  },
  name: {
    color: Colors.BLACK,
    fontWeight: '500'
  }
});

const mapStateToProps = ({ user, navState }) => ({ user, navState });

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(SideBarMenu);
