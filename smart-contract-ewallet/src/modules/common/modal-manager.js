import DialogManager, { SlideAnimation } from 'react-native-dialog-component';
import { Dimensions, Platform } from 'react-native';

const ModalManager = {
  show: (
    children,
    widthRatio: number = 94,
    position: string,
    extraStyle: Object = {}
  ) => {
    const standardStyle = {
      borderRadius: 4,
      paddingTop: 8,
      paddingBottom: 0,
      paddingHorizontal: 0
    };
    let bottomStyle;
    switch (position) {
      case 'bottom':
        bottomStyle = { position: 'absolute', bottom: 12 };
        break;
      case 'middle':
        bottomStyle = { marginBottom: Platform.OS === 'android' ? 60 : 80 };
        break;
      default:
    }
    DialogManager.show(
      {
        title: null,
        width: Dimensions.get('window').width * (widthRatio / 100),
        dialogStyle: { ...standardStyle, ...bottomStyle, ...extraStyle },
        titleAlign: 'center',
        animationDuration: 200,
        dialogAnimation: new SlideAnimation({ slideFrom: 'bottom' }),
        children
      },
      () => {}
    );
  },

  dismiss: () => {
    DialogManager.dismiss();
  }
};

export default ModalManager;
