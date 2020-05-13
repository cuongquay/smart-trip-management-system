/**
 * @flow
 */

'use strict';

import Types from 'actions/types';

const INITIAL_STATE = {
  language: 'vi'
};

export const config = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SET_LANGUAGE:
      return {
        ...state,
        language: action.language
      };
    default:
      return state;
  }
};
