import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Colors } from 'common/ui';

const { width, height } = Dimensions.get('window');

const _styles = StyleSheet.create({
  container: {
    width: width,
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    height: height,
    flex: 1
  },
  pagesContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    width: width,
    height: height - 80
  },
  styleButtonHeader: {
    paddingHorizontal: 4,
    paddingVertical: 4
  },
  info: {
    width: 0.92 * width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 8
  },
  avatar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 21,
    height: 21,
    marginRight: 6
  },
  function: {
    paddingVertical: 18,
    width,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  contents: {
    flex: 1,
    width: '100%',
    marginTop: 5,
    paddingTop: 5,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  animationViewHeader: {
    paddingTop: 6,
    justifyContent: 'center',
    alignItems: 'center',
    width
  },
  iconButton: {
    width: 22,
    height: 22
  },
  styleModal: {
    flex: 1,
    marginHorizontal: 0,
    marginVertical: 0,
    zIndex: 9800,
    justifyContent: 'flex-end',
    height: height,
    backgroundColor: 'transparent'
  },
  balance: {
    fontSize: 15,
    fontFamily: 'Averta-SemiBold',
    color: 'rgb(137,139,141)'
  }
});

export default _styles;
