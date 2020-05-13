import Types from './types';

export function saveUserData(data: Object) {
  // Flatten data from server:
  // https://puu.sh/yugyn.png
  return {
    type: Types.SAVE_USER_DATA,
    user: {
      expired_at: data.expired_at,
      token: data.token,
      ...data.customer
    }
  };
}

export function updateUserData(data: Object) {
  return {
    type: Types.UPDATE_USER_DATA,
    data
  };
}

export function clearUserData() {
  return {
    type: Types.CLEAR_USER_DATA
  };
}

/**
 * Xoá token trong store.
 * Dùng khi để màn hình quá session.
 */
export function clearUserAuth() {
  return {
    type: Types.CLEAR_USER_AUTH
  };
}

/**
 * Xoá id user trong store.
 * Dùng khi call API logout.
 */
export function clearUserSession() {
  return {
    type: Types.CLEAR_USER_SESSION
  };
}

export function requestUserBalance() {
  return {
    type: Types.REQUEST_USER_BALANCE
  };
}

/**
 * {
 *   "current_balance": 590000,
 *   "currency": "VND"
 * }
 */
export function receivedUserBalance(data) {
  return {
    type: Types.RECEIVED_USER_BALANCE,
    data
  };
}

// BADGE
export function requestBadgeStatus() {
  return {
    type: Types.REQUEST_BADGE_STATUS
  };
}

export function receivedBadgeStatus(data) {
  return {
    type: Types.RECEIVED_BADGE_STATUS,
    data
  };
}

// profile
export function requestGetProfile() {
  return {
    type: Types.REQUEST_GET_PROFILE
  };
}

export function receivedGetProfile(data) {
  return {
    type: Types.RECEIVED_GET_PROFILE,
    data
  };
}

// Get List Accounts
export function requestGetAccount() {
  return {
    type: Types.REQUEST_GET_ACCOUNTS
  };
}

export function receivedGetAccount(data) {
  return {
    type: Types.RECEIVED_GET_ACCOUNTS,
    data
  };
}

// Get Default Account
export function requestGetDefaultAccount() {
  return {
    type: Types.REQUEST_GET_DEFAULT_ACCOUNTS
  };
}

export function receivedGetDefaultAccount(data) {
  return {
    type: Types.RECEIVED_GET_DEFAULT_ACCOUNTS,
    data
  };
}
