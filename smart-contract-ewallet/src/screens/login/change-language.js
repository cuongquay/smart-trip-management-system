import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter
} from 'react-native';
import { Icon } from 'react-native-elements';
import { I18n, switchLanguage } from 'common';
import { Colors } from 'common/ui';
import { connect } from 'react-redux';
import { ButtonBack, ButtonBlank } from 'common/ui/header';

const ButtonLanguage = ({ selected, image, name, style, onPress }) => {
  return (
    <TouchableOpacity style={[styles.buttonLanguage, style]} onPress={onPress}>
      <View
        style={{
          flexDirection: 'row'
        }}
      >
        <Image
          style={{
            width: 28,
            height: 20,
            marginRight: 15
          }}
          source={image}
        />
        <Text style={styles.textNameLanguage}>{name}</Text>
      </View>
      {selected ? (
        <Icon name="check" type="octicon" size={20} color={Colors.BLACK} />
      ) : null}
    </TouchableOpacity>
  );
};

class ChangeLanguage extends Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;
    return {
      title: I18n.t('setting.change_language'),
      headerLeft: <ButtonBack onPress={() => goBack()} color={Colors.BLACK} />,
      headerRight: <ButtonBlank />,
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 19
      }
    };
  };

  constructor(props) {
    super(props);
    const { config } = props;
    this.state = {
      activeIndex: config.language === 'vi' ? 0 : 1
    };
    this.languages = [
      {
        name: 'Tiếng Việt',
        code: 'vi',
        image: require('assets/flags/vi.png')
      }
      // {   name: 'English',   code: 'en',   image: require('assets/flags/en.png') }
    ];
  }

  changeLanguage(item, idx) {
    const { activeIndex } = this.state;
    if (idx !== activeIndex) {
      this.setState({ activeIndex: idx });
      switchLanguage(item.code);
      DeviceEventEmitter.emit('UPDATE_LANGUAGE', item.code);
      const { navigation } = this.props;
      navigation.goBack();
    }
  }

  render() {
    const { activeIndex } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.containerHeader}>
          <Text style={styles.title}>Chọn ngôn ngữ</Text>
          {this.languages.map((item, idx) => (
            <ButtonLanguage
              key={String(Math.random())}
              name={item.name}
              image={item.image}
              selected={activeIndex === idx}
              onPress={() => this.changeLanguage(item, idx)}
            />
          ))}
        </View>
      </View>
    );
  }
}

let { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    flex: 1,
    alignItems: 'center'
  },
  containerHeader: {
    width: width * 0.92,
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    marginTop: 20,
    paddingBottom: 15
  },
  textNameLanguage: {
    color: 'rgb(47,54,66)',
    fontSize: 16,
    fontWeight: '500'
  },
  buttonLanguage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.92,
    paddingBottom: 10,
    paddingTop: 15,
    borderColor: 'rgb(223,223,223)',
    borderBottomWidth: 1,
    alignItems: 'center'
  },
  title: {
    color: 'rgb(47,54,66)',
    fontSize: 17,
    marginBottom: 10
  }
});

const mapStateToProps = state => ({ config: state.config });
export default connect(mapStateToProps)(ChangeLanguage);
