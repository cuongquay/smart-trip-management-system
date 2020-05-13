import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from 'common/ui';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingBottom: 12,
    paddingTop: 24
  },
  headerCustom: {
    marginTop: 26,
    paddingHorizontal: 15
  },
  logo: {
    marginTop: 10,
    width: width / 4,
    height: 72
  },
  subtitle: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: Colors.BLACK
  },
  boldText: {
    fontWeight: '900'
  },
  placeholder: {
    height: 20
  },
  flipCardContainer: {
    borderWidth: 0,
    flex: 1,
    height: 220,
    paddingTop: 24
  },
  note: {
    marginTop: 18
  },
  noCode: {
    color: Colors.BLACK
  }
});

export default styles;
