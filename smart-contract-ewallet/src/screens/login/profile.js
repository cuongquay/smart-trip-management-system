import React, { Component } from 'react';
import ImagePicker from 'react-native-image-picker';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { setLoadingView, I18n, ModalManager, ToastManager } from 'common';

import { Text, Colors } from 'common/ui';
import { ButtonBack, ButtonBlank } from 'common/ui/header';
import { apiProfile } from 'apis/api-profile';
import { colors } from 'react-native-elements';
import { updateUserData } from 'actions/actions-user';
import { formatName } from 'utilities';

const fileData = {
  full_name: 'full_name',
  birthday: 'birthday',
  identity_card: 'identity_card',
  identity_image: 'identity_image',
  avatar_img: 'avatar_img'
};

let { width } = Dimensions.get('window');

const FormInfo = ({
  name,
  details,
  styleTextDetails,
  styleContainer,
  success,
  onPress
}) => {
  return (
    <TouchableOpacity
      onPress={!success ? onPress : null}
      style={[styles.containerInfo, styleContainer]}
    >
      <Text style={styles.textInfo}>{name}</Text>
      <View style={styles.containerConfirm}>
        <Text style={[styles.textInfo, styleTextDetails]}>{details}</Text>
        <Image
          style={{
            width: 16,
            height: 16,
            marginLeft: 7
          }}
          source={
            !success
              ? require('assets/home/edit.png')
              : require('assets/home/roundedCheckbox.png')
          }
        />
      </View>
    </TouchableOpacity>
  );
};

const CameraContainer = ({ onPress, uri }) => {
  console.log(uri);
  return (
    <TouchableOpacity onPress={onPress} style={styles.containerCamera}>
      {uri ? (
        <Image
          style={{
            width: '100%',
            height: 120
          }}
          source={{
            uri: uri
          }}
        />
      ) : (
        <View
          style={{
            paddingBottom: 20,
            paddingTop: 24,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Image
            style={{
              width: 49.2,
              height: 40,
              marginBottom: 5
            }}
            source={require('assets/home/camera.png')}
          />
          <Text
            style={{
              fontSize: 17,
              color: Colors.BLACK
            }}
          >
            {I18n.t('profile.take_photo_id_card')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const DialogComponent = ({ onClose, dataDialog }) => {
  return (
    <View style={stylesDialog.container}>
      <Text style={stylesDialog.titleDialog}>{dataDialog.title}</Text>
      <View style={stylesDialog.content}>
        <Text style={stylesDialog.textContent}>{dataDialog.content}</Text>
        <Text style={stylesDialog.textContent}>
          {dataDialog.detail}{' '}
          <Text
            style={{
              color: Colors.BLACK,
              fontSize: 16
            }}
          >
            {dataDialog.privacy_policy}
          </Text>
        </Text>
      </View>
      <TouchableOpacity style={stylesDialog.buttonDialog} onPress={onClose}>
        <Text
          style={{
            color: Colors.BLACK,
            fontSize: 17
          }}
        >
          {dataDialog.close}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
class Profile extends Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;
    return {
      title: I18n.t('profile.header_title'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK} />,
      headerRight: <ButtonBlank />,
      headerTitleStyle: {
        width: width * 0.9,
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 19
      }
    };
  };

  componentWillMount() {
    this.getFullProfile();
  }
  showDialog = () => {
    ModalManager.show(
      <DialogComponent
        dataDialog={I18n.t('dialogs.safety_information')}
        onClose={ModalManager.dismiss}
      />
    );
  };

  goEdit(params) {
    const { navigation } = this.props;
    navigation.navigate('EditInfoScreen', params);
  }

  onTakePicture = () => {
    let options = {
      // Open Image Library:
      maxWidth: 400,
      title: I18n.t('profile.select_photo'),
      takePhotoButtonTitle: I18n.t('profile.take_photo'),
      chooseFromLibraryButtonTitle: I18n.t('profile.select_photo_from_library'),
      cancelButtonTitle: I18n.t('common.cancel')
    };
    ImagePicker.showImagePicker(options, response => {
      if (response.uri) {
        let data = new FormData();
        data.append('image', {
          uri: response.uri,
          type: response.type || 'image/jpeg',
          name: response.fileName || 'avatar.jpg'
        });
        this.updateImageProfile(fileData.identity_image, data);
      }
    });
  };

  updateImageProfile(fieldName, data) {
    const { dispatch, user } = this.props;
    setLoadingView(true);
    apiProfile
      .uploadImage(user.id, data)
      .then(result => {
        setLoadingView(false);
        if (result.code) {
          const { title, message } = getExceptionMessage(result.code);
          ToastManager.show(title, message);
          return;
        }
        let userData = {
          customer: user,
          expired_at: user.expired_at,
          token: user.token
        };
        let data = {
          [fieldName]: result.url,
          field: fieldName
        };
        apiProfile
          .update(
            user.id,
            data.avatar_img,
            data.full_name,
            data.reset_email,
            data.reset_phone,
            data.birthday,
            data.identity_card,
            data.identity_image
          )
          .then(rs => {
            setLoadingView(false);
            if (rs.code) {
              const { title, message } = getExceptionMessage(rs.code);
              ToastManager.show(title, message);
              return;
            }
            if (data.field === fileData.avatar_img) {
              userData.customer.avatar_img = rs.avatar_img;
            }
            if (data.field === fileData.identity_image) {
              userData.customer.identity_image = rs.identity_image;
            }
            dispatch(updateUserData(userData));
            ToastManager.show(
              I18n.t('update_profile.dialog_update_info.title'),
              I18n.t('update_profile.dialog_update_info.content')
            );
          })
          .catch(er => {
            console.log(er);
            setLoadingView(false);
          });
      })
      .catch(e => {
        setLoadingView(false);
        console.log(e);
      });
  }
  async onSelectAvatar() {
    var options = {
      // Open Image Library:
      maxWidth: 400,
      title: I18n.t('profile.select_photo'),
      takePhotoButtonTitle: I18n.t('profile.take_photo'),
      chooseFromLibraryButtonTitle: I18n.t('profile.select_photo_from_library'),
      cancelButtonTitle: I18n.t('common.cancel')
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
      dispatch(setLoading(false));
      const { title, message } = getExceptionMessage(e.code);
      return ToastManager.show(title, message);
    }
  }

  getFullProfile() {
    const { user, dispatch } = this.props;
    apiProfile
      .get(user.id)
      .then(result => {
        console.log(result);
        if (!result.code) {
          let customer = Object.assign(user, result);
          console.log(customer);
          let data = {
            customer: customer,
            expired_at: user.expired_at,
            token: user.token
          };
          dispatch(updateUserData(data));
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const { user } = this.props;
    const {
      full_name,
      phone_number,
      verified_identity,
      verified_name,
      verified_phone,
      identity_image
    } = user;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={{
            width
          }}
        >
          <View
            style={{
              alignItems: 'center'
            }}
          >
            <TouchableOpacity
              onPress={() => {
                this.onSelectAvatar();
              }}
            >
              <Image
                style={styles.imageAvatar}
                source={
                  user.avatar_img
                    ? {
                        uri: user.avatar_img
                      }
                    : require('assets/home/avatar_default.png')
                }
              />
            </TouchableOpacity>
            {verified_identity ? (
              <View
                style={[
                  styles.containerConfirm,
                  {
                    marginBottom: 20,
                    marginTop: 10
                  }
                ]}
              >
                <Image
                  style={{
                    width: 14,
                    height: 14,
                    marginRight: 3
                  }}
                  source={require('assets/home/roundedCheckbox.png')}
                />
                <Text
                  style={{
                    color: Colors.STRONG_GREEN,
                    fontSize: 13
                  }}
                >
                  {I18n.t('profile.account_authentication')}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.containerConfirm,
                  {
                    marginBottom: 20,
                    marginTop: 10
                  }
                ]}
              >
                <Image
                  style={{
                    width: 14,
                    height: 14,
                    marginRight: 3
                  }}
                  source={require('assets/home/shape.png')}
                />
                <Text
                  style={{
                    color: Colors.RED,
                    fontSize: 13
                  }}
                >
                  {I18n.t('profile.account_unauthentication')}
                </Text>
              </View>
            )}
            <FormInfo
              success={verified_name}
              name={I18n.t('profile.fullname')}
              details={formatName(full_name)}
              onPress={() => {
                this.goEdit({
                  id: 1,
                  name: I18n.t('profile.fullname'),
                  fieldName: fileData.full_name,
                  data: full_name
                });
              }}
            />
            <FormInfo
              success={verified_phone}
              name={I18n.t('profile.primary_phone')}
              details={phone_number}
              styleTextDetails={{
                color: 'rgb(137,139,141)'
              }}
              onPress={() => {}}
            />
            <FormInfo
              success={false}
              name={I18n.t('profile.birthday')}
              details={
                user.birthday ? user.birthday : I18n.t('profile.not_update')
              }
              styleTextDetails={{
                color: user.birthday ? colors.BLACK : Colors.RED
              }}
              onPress={() => {
                this.goEdit({
                  id: 3,
                  name: I18n.t('profile.birthday'),
                  fieldName: fileData.birthday,
                  data: user.birthday ? user.birthday : ''
                });
              }}
            />
            <FormInfo
              success={verified_identity}
              name={I18n.t('profile.people_id')}
              styleTextDetails={{
                color: user.identity_card ? colors.BLACK : Colors.RED
              }}
              details={
                user.identity_card
                  ? user.identity_card
                  : I18n.t('profile.not_update')
              }
              styleContainer={{
                borderBottomWidth: 0
              }}
              onPress={() => {
                this.goEdit({
                  id: 4,
                  name: I18n.t('profile.people_id'),
                  fieldName: fileData.identity_card
                });
              }}
            />
          </View>
        </View>
        {!verified_identity && (
          <CameraContainer onPress={this.onTakePicture} uri={identity_image} />
        )}
        <TouchableOpacity
          onPress={() => {
            this.showDialog();
          }}
          style={styles.containerEnsure}
        >
          <Image
            style={{
              width: 13,
              height: 16,
              marginRight: 7
            }}
            source={require('assets/home/sercurityIc.png')}
          />
          <Text
            style={{
              fontSize: 12
            }}
          >
            {I18n.t('profile.addition_customer_presonal_info') + ' '}
            <Text style={styles.underline}>
              {I18n.t('profile.addition_is_protected')}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    paddingBottom: 16,
    flex: 1
  },
  imageAvatar: {
    width: 96,
    height: 96,
    marginBottom: 5,
    borderRadius: 48
  },
  containerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: 'rgb(238,238,238)',
    borderBottomWidth: 1,
    width: '90%',
    paddingBottom: 12,
    paddingTop: 12
  },
  textInfo: {
    fontSize: 17,
    color: 'rgb(47,54,66)'
  },
  containerEnsure: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: 0.9 * width,
    marginTop: 30,
    alignItems: 'center'
  },
  containerConfirm: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerCamera: {
    width: 0.9 * width,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgb(223,223,223)',
    borderWidth: 0.5,
    marginTop: 10
  },
  underline: {
    fontSize: 12,
    color: Colors.BLACK,
    textDecorationLine: 'underline'
  }
});

const stylesDialog = {
  container: {
    justifyContent: 'center',
    width: 0.95 * width,
    alignItems: 'center'
  },
  titleDialog: {
    color: 'rgb(47,54,66)',
    fontSize: 19,
    marginBottom: 5,
    marginTop: 10
  },
  content: {
    justifyContent: 'center',
    width: 0.9 * width
  },
  textContent: {
    color: 'rgb(47,54,66)',
    fontSize: 16,
    marginLeft: 3
  },
  buttonDialog: {
    borderTopWidth: 1,
    borderColor: 'rgb(223,223,223)',
    width: 0.95 * width,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 50
  }
};

const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });
export default connect(mapStateToProps, mapDispatchToProps)(Profile);
