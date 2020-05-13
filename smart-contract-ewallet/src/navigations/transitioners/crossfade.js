import { Animated, Easing } from 'react-native';
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';

const transitionSpec = {
  duration: 700,
  easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
  timing: Animated.timing
};

const crossFadeTransitionConfig = () => {
  return {
    transitionSpec: transitionSpec,
    screenInterpolator: sceneProps => {
      const { position, layout, scene, index } = sceneProps;

      const height = layout.initHeight;
      const width = layout.initWidth;
      const { route } = scene;
      // We can access our navigation params on the scene's 'route' property
      const params = route.params || {};
      // transtion is param in navigate function. that is how to transition between screens
      const transition = params.transition || 'default';

      const translateX = position.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [width, 0, 0]
      });

      const translateY = position.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [height, 0, 0]
      });

      const opacity = position.interpolate({
        inputRange: [index - 1, index - 0.5, index],
        outputRange: [0, 1, 1]
      });

      const scale = position.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [4, 1, 1]
      });

      // the following is ways to transiton screens
      const slideFromRight = { transform: [{ translateX }] };
      const scaleWithOpacity = {
        opacity,
        transform: [{ scaleX: scale }, { scaleY: scale }]
      };
      const slideInFromBottom = { transform: [{ translateY }] };
      const crossFadeTransition = { opacity };

      return {
        fromRight: slideFromRight,
        fromBottom: slideInFromBottom,
        scaleWithOpacity: scaleWithOpacity,
        crossFade: crossFadeTransition,
        default: CardStackStyleInterpolator.forVertical(sceneProps)
      }[transition];
    }
  };
};

export { crossFadeTransitionConfig };
