/**
 * @flow
 */

'use strict';

import AppNavigator from 'navigations';
import { tracker } from 'utilities';

export const navState = (state, action) => {
  switch (action.type) {
    default:
      if (action.type === 'Navigation/NAVIGATE') {
        const { routes } = state;
        const { routeName } = action;
        tracker.trackScreenView(routeName);

        const currentRoute = routes[routes.length - 1];
        if (currentRoute.routeName === routeName) {
          return state;
        }
      }

      return AppNavigator.router.getStateForAction(action, state);
  }
};
