/**
 * @flow
 */

'use strict';

import Types from 'actions/types';

const INITIAL_STATE = null;

export const user = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SAVE_USER_DATA:
      return action.user;
    case Types.UPDATE_USER_DATA:
      return {
        ...state,
        ...action.data
      };
    case Types.CLEAR_USER_DATA:
      return INITIAL_STATE;
    case Types.CLEAR_USER_AUTH:
      return {
        ...state,
        token: null
      };
    case Types.CLEAR_USER_SESSION:
      return {
        ...state,
        id: null
      };
    case Types.RECEIVED_USER_BALANCE:
      return {
        ...state,
        currency: action.data.currency,
        current_balance: action.data.current_balance
      };
    case Types.RECEIVED_BADGE_STATUS:
      return {
        ...state,
        total: action.data.total,
        unread: action.data.unread
      };
    case Types.RECEIVED_GET_PROFILE:
      return {
        ...state,
        full_name: action.data.full_name,
        avatar_img: action.data.avatar_img,
        reset_email: action.data.reset_email,
        reset_phone: action.data.reset_phone,
        birthday: action.data.birthday,
        identity_card: action.data.identity_card,
        identity_image: action.data.identity_image
      };
    case Types.RECEIVED_GET_ACCOUNTS:
      return {
        ...state,
        accounts: action.data
      };
    case Types.RECEIVED_GET_DEFAULT_ACCOUNTS:
      return {
        ...state,
        default_account: action.data
      };
    default:
      return state;
  }
};
