import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addNavigationHelpers } from 'react-navigation';
import {
  DrawerLayoutAndroid,
  Platform,
  View,
  ActivityIndicator,
  Dimensions,
  DeviceEventEmitter,
  BackHandler,
  StyleSheet
} from 'react-native';
import { Events } from 'common';
import { Colors } from 'common/ui';
import DrawerLayout from 'react-native-drawer-layout-polyfill';
import AppNavigator from 'navigations';
import { goBack } from 'actions/actions-navigation';
import { showModal } from 'actions/actions-common';
import SideBarMenu from 'screens/menu';
import { addListener } from 'stores';

class RootContainer extends Component {
  constructor(props) {
    super(props);
    this.getDrawerLockMode = this.getDrawerLockMode.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    DeviceEventEmitter.addListener(
      Events.DRAWER_TOGGLE,
      isOpen => (isOpen ? this.drawer.openDrawer() : this.drawer.closeDrawer())
    );
    DeviceEventEmitter.addListener(Events.DRAWER_CLOSE, () =>
      this.drawer.closeDrawer()
    );
    BackHandler.addEventListener('hardwareBackPress', () => {
      dispatch(goBack());
      return true;
    });
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener(Events.DRAWER_TOGGLE);
    DeviceEventEmitter.removeListener(Events.DRAWER_CLOSE);
    BackHandler.removeEventListener('hardwareBackPress');
  }

  getDrawerLockMode() {
    const { routes } = this.props.navState;
    const { length } = routes;
    if (routes[length - 1].routeName === 'HomeScreen') return 'unlocked';
    return 'locked-closed';
  }

  closeUpdateModal = () => {
    this.props.dispatch(showModal(false));
  };

  render() {
    const { dispatch, navState, common } = this.props;
    return (
      <Fragment>
        <DrawerLayout
          ref={drawerLayout => {
            this.drawer = drawerLayout;
          }}
          renderNavigationView={() => <SideBarMenu dispatch={dispatch} />}
          drawerWidth={0.95 / 2 * Dimensions.get('window').width}
          drawerBackgroundColor={'white'}
          drawerPosition={
            Platform.OS === 'android'
              ? DrawerLayoutAndroid.positions.Left
              : 'left'
          }
          onDrawerClose={() => (this.drawerIsOpen = false)}
          onDrawerOpen={() => (this.drawerIsOpen = true)}
          statusBarBackgroundColor={Colors.WHITE}
          drawerLockMode={this.getDrawerLockMode()}
          useNativeAnimations
        >
          <AppNavigator
            navigation={addNavigationHelpers({
              dispatch,
              state: navState,
              addListener
            })}
          />
        </DrawerLayout>
        {common.loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={Colors.WHITE} />
          </View>
        )}
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
    ...StyleSheet.absoluteFillObject
  }
});

RootContainer.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  const { user, navState, common } = state;
  return {
    user,
    navState,
    common
  };
};

export default connect(mapStateToProps)(RootContainer);
