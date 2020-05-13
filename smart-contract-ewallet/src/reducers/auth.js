/**
 * @flow
 */

'use strict';

import Types from 'actions/types';

/**
 * Should contain:
 * phone
 * request_id // for login
 * passcode_request_id
 * customer_id
 * verify_mode
 * access_code
 * device_info
 */

const INITIAL_STATE = null;

export const auth = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.UPDATE_REGISTRATION_DATA:
      return {
        ...state,
        ...action
      };
    case Types.CLEAR_REGISTRATION_DATA:
      return INITIAL_STATE;
    case Types.CACHE_PHONE_NUMBER:
      return { phone_number: action.phone_number };
    default:
      return state;
  }
};
