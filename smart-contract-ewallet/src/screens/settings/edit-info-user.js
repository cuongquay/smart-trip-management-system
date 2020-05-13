import React, { Component, Fragment } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Keyboard,
  Platform,
  TouchableOpacity
} from 'react-native';
import moment from 'moment';
import { connect } from 'react-redux';
import { ToastManager, I18n } from 'common';
import { ButtonBack, ButtonBlank } from 'common/ui/header';
import { Colors, Text, ButtonBottomChoices, MaterialInput } from 'common/ui';
import { setLoading } from 'actions/actions-common';
import { updateUserData } from 'actions/actions-user';
import {
  isSpecialCharactors,
  isDigitOnly,
  getExceptionMessage,
  pickBirthday
} from 'utilities';
import { apiProfile } from 'apis/api-profile';
const fileData = {
  full_name: 'full_name',
  birthday: 'birthday',
  identity_card: 'identity_card'
};
let { width } = Dimensions.get('window');
class EditInfo extends Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;
    return {
      title: I18n.t('update_profile.edit_info'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK} />,
      headerRight: <ButtonBlank />
    };
  };

  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      offset: 0,
      text: this.props.navigation.state.params.data
        ? this.props.navigation.state.params.data
        : ''
    };
    console.log(this.props);
  }

  componentDidMount() {
    this.props.navigation.state.params.fieldName === 'birthday' &&
      this.pickDateTime();

    if (Platform.OS === 'ios') {
      this.keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        e => this.setState({ offset: e.endCoordinates.height })
      );
      this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => this.setState({ offset: 0 })
      );
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
  }

  checkName = () => {
    if (!this.state.text || !this.state.text.trim()) {
      const { title, message } = getExceptionMessage(
        'EmptyProfileNameException'
      );
      ToastManager.show(title, message);
      return false;
    }
    if (isSpecialCharactors(this.state.text.trim())) {
      const { title, message } = getExceptionMessage(
        'SpecialCharactersNotSupported'
      );
      ToastManager.show(title, message);
      return false;
    }
    if (isDigitOnly(this.state.text.trim())) {
      const { title, message } = getExceptionMessage('NumberOnlyNotSupported');
      ToastManager.show(title, message);
      return false;
    }
    if (this.state.text.trim().length < 2) {
      const { title, message } = getExceptionMessage(
        'MinimumProfileNameException'
      );
      ToastManager.show(title, message);
      return false;
    }
    if (
      this.state.text.trim().match(/[0-9]/g) !== null &&
      this.state.text.trim().length -
        this.state.text.trim().match(/[0-9]/g).length <
        2
    ) {
      const { title, message } = getExceptionMessage('NumberOnlyNotSupported');
      ToastManager.show(title, message);
      return false;
    }
    return true;
  };

  checkCMND() {
    if (!this.state.text || !this.state.text.trim()) {
      const { title, message } = getExceptionMessage(
        'EmptyIdentityCardException'
      );
      ToastManager.show(title, message);
      return false;
    }
    if (isSpecialCharactors(this.state.text.trim())) {
      const { title, message } = getExceptionMessage(
        'SpecialCharactersNotSupported'
      );
      ToastManager.show(title, message);
      return false;
    }
    if (
      this.state.text.trim().length !== 9 &&
      this.state.text.trim().length !== 12
    ) {
      const { title, message } = getExceptionMessage(
        'MinimumIdentityCardException'
      );
      ToastManager.show(title, message);
      return false;
    }
    if (this.state.text.trim().match(/[^0-9]/g) !== null) {
      const { title, message } = getExceptionMessage('WordNotSupported');
      ToastManager.show(title, message);
      return false;
    }
    return true;
  }

  updateProfile() {
    const { navigation, user, dispatch } = this.props;
    const { goBack, state } = navigation;
    const { params } = state;
    dispatch(setLoading(true));
    let userData = {
      customer: user,
      expired_at: user.expired_at,
      token: user.token
    };
    let data = {
      [params.fieldName]: this.state.text,
      field: params.fieldName
    };
    if (params.fieldName === fileData.full_name) {
      if (this.checkName()) {
        data = {
          full_name: this.state.text,
          field: fileData.full_name
        };
      } else {
        dispatch(setLoading(false));
        return;
      }
    } else if (params.fieldName === fileData.identity_card) {
      if (this.checkCMND()) {
        data = {
          identity_card: this.state.text,
          field: fileData.identity_card
        };
      } else {
        dispatch(setLoading(false));
        return;
      }
    } else if (params.fieldName === fileData.birthday) {
      console.log(this.state.text);
      data = {
        birthday: this.state.text,
        field: fileData.birthday
      };
    }
    apiProfile
      .update(
        user.id,
        data.avatar_img,
        data.full_name,
        data.reset_email,
        data.reset_phone,
        moment(data.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        data.identity_card,
        data.identity_image
      )
      .then(result => {
        console.log(result);
        if (result.code) {
          dispatch(setLoading(false));
          const { title, message } = getExceptionMessage(result.code);
          ToastManager.show(title, message);
          return;
        }
        if (data.field === fileData.full_name) {
          userData.customer.full_name = result.full_name;
        }
        if (data.field === fileData.identity_card) {
          console.log(userData.customer.identity_card);
          userData.customer.identity_card = result.identity_card;
        }
        if (data.field === fileData.birthday) {
          console.log(userData.customer.identity_card);
          userData.customer.birthday = result.birthday;
        }
        delete userData.customer.expired_at;
        delete userData.customer.token;
        dispatch(updateUserData(userData));
        dispatch(setLoading(false));
        goBack();
        ToastManager.show(
          I18n.t('update_profile.dialog_update_info.title'),
          I18n.t('update_profile.dialog_update_info.content')
        );
      })
      .catch(e => {
        console.log(e);
        dispatch(setLoading(false));
      });
  }
  pickDateTime() {
    pickBirthday()
      .then(date => {
        console.log(date);
        this.setState({ text: `${date.day}/${date.month}/${date.year}` });
      })
      .catch(e => console.log(e));
  }
  checkEnableButton = () => {
    const { navigation } = this.props;
    const { state } = navigation;
    const { params } = state;
    if (params.fieldName == fileData.identity_card) {
      if (
        (this.state.text.trim().length == 9 ||
          this.state.text.trim().length == 12) &&
        this.state.text.trim().match(/[^0-9]/g) == null
      ) {
        return true;
      }
      return false;
    }
    return true;
  };
  render() {
    const { navigation } = this.props;
    const { text, offset } = this.state;
    const { state, goBack } = navigation;
    const { params } = state;
    return (
      <View style={styles.container}>
        <View style={styles.containerHeader}>
          <View style={styles.spacing} />{' '}
          {params.fieldName === fileData.birthday ? (
            <Fragment>
              <Text style={styles.birthdayLabel}>
                {I18n.t('profile.birthday')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.pickDateTime();
                }}
                style={styles.containerBirthday}
              >
                <Text semiBold style={styles.birthdayText}>
                  {moment(text, 'DD/MM/YYYY').format('DD/MM/YYYY') || ''}
                </Text>
              </TouchableOpacity>
            </Fragment>
          ) : (
            <MaterialInput
              maxLength={params.fieldName == fileData.identity_card ? 12 : null}
              keyboardType={
                params.fieldName == fileData.identity_card
                  ? 'numeric'
                  : 'default'
              }
              labelFontSize={14}
              autoCapitalize="words"
              value={text}
              label={params.name}
              onChangeText={value => {
                this.setState({ text: value });
              }}
              onClear={() => {
                this.setState({ text: '' });
              }}
              autoFocus
              showIcon={text ? true : false}
            />
          )}
        </View>
        <ButtonBottomChoices
          offset={offset}
          onCancel={() => goBack()}
          onSave={() => this.checkEnableButton() && this.updateProfile()}
          enableSave={this.checkEnableButton()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  spacing: {
    height: 42
  },
  containerHeader: {
    width,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'center'
  },
  containerBirthday: {
    width: '100%',
    borderBottomWidth: 1,
    paddingVertical: 3,
    borderColor: Colors.BLACK,
    marginTop: 3
  },
  birthdayLabel: {
    fontSize: 18,
    width: '100%',
    textAlign: 'left',
    color: Colors.BLACK
  },
  birthdayText: {
    fontSize: 17,
    paddingTop: 20
  }
});

const mapStateToProps = ({ user, navState }) => ({ user, navState });
const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(EditInfo);
