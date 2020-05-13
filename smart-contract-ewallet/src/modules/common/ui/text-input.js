import React, { Fragment, Component } from 'react';
import { View, Dimensions, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Colors from './colors';
import Text from './text-react-native';

export default class TextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cursorVisible: false
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(prevState => {
        return {
          cursorVisible: !prevState.cursorVisible
        };
      });
      this.forceUpdate();
    }, 1000);
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  render() {
    const {
      value,
      borderRadius,
      activated,
      fontSize,
      textCenter,
      height
    } = this.props;
    const { cursorVisible } = this.state;
    return (
      <Fragment>
        <View
          style={[
            styles.inputWrapper,
            { height: height || 50, borderRadius: borderRadius || 25 }
          ]}
        >
          <View
            style={[
              styles.textWrapper,
              { alignItems: textCenter ? 'center' : 'flex-start' }
            ]}
          >
            <Text
              semiBold
              style={[
                styles.textValue,
                activated
                  ? { color: Colors.BLACK }
                  : { color: Colors.LIGHT_BROWN },
                { fontSize: fontSize || 28 }
              ]}
            >
              {value}
              <Text
                regular
                style={[
                  { fontSize: fontSize || 30 },
                  activated && cursorVisible
                    ? styles.inputActivated
                    : styles.inputDeactivated
                ]}
              >{`I`}</Text>
            </Text>
          </View>
        </View>
      </Fragment>
    );
  }
}

TextInput.defaultProps = {
  onClear: d => console.log(d)
};

TextInput.propTypes = {
  onClear: PropTypes.func
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  inputWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 2,
    backgroundColor: '#ebf0fa'
  },
  textWrapper: {
    paddingHorizontal: 4,
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    width: width * 0.7
  },
  textValue: {
    textAlignVertical: 'center',
    color: Colors.BLACK,
    letterSpacing: 1
  },
  inputDeactivated: {
    opacity: 0,
    color: Platform.select({
      ios: Colors.BLACK,
      android: Colors.BLACK
    })
  },
  inputActivated: {
    opacity: 1,
    color: Platform.select({
      ios: Colors.BLACK,
      android: '#ebf0fa'
    })
  }
});
