/**
 * @flow
 */

'use strict';

import Types from 'actions/types';

const INITIAL_STATE = {
  loading: false,
  showModal: false
};

export const common = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SET_LOADING:
      delete action.type;
      return {
        ...state,
        loading: action.loading
      };
    case Types.SHOW_UPDATE_MODAL:
      delete action.type;
      return {
        ...state,
        showModal: action.showModal
      };
    default:
      return state;
  }
};
