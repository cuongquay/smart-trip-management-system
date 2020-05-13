/**
 * @flow
 */

'use strict';

import { NavigationActions } from 'react-navigation';

export function navigate(screenName, params) {
  return NavigationActions.navigate({
    routeName: screenName,
    params
  });
}

export function reset(routeStack: Array, params: any, index = 0) {
  const newStack = [];
  routeStack.forEach(item =>
    newStack.push(NavigationActions.navigate({ routeName: item, params }))
  );
  return NavigationActions.reset({
    index: index,
    actions: newStack,
    key: null
  });
}

export function goBack(screen, navState = null) {
  // screen: screen after screen want to go back
  let screenKey = screen;
  if (navState) {
    navState.routes.map(navData => {
      if (navData.routeName === screen) screenKey = navData.key;
    });
  }
  return NavigationActions.back({ key: screenKey });
}
