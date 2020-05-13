'use strict';

import { delay } from 'redux-saga';
import { call, select, put } from 'redux-saga/effects';
import {
  receivedUserBalance,
  receivedBadgeStatus,
  receivedGetProfile,
  receivedGetAccount,
  requestGetAccount,
  receivedGetDefaultAccount,
  requestGetDefaultAccount
} from 'actions/actions-user';
import { apiCustomer } from 'apis/api-customer';
import { apiNotification } from 'apis/api-notification';
import { apiProfile } from 'apis/api-profile';
import { apiAccount } from 'apis/api-account';
import { showModal } from 'actions/actions-common';

export function* updateUserBalance() {
  try {
    const state = yield select();
    const { user } = state;
    if (user) {
      yield delay(3000);
      const result = yield call(apiCustomer.getCurrentBalances, user.id);
      console.log(result);
      if (!result.code) {
        yield put(receivedUserBalance(result));
      } else {
        if (result.code === 'RequireSoftwareUpdateException')
          yield put(showModal(true));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

export function* updateBadgeStatus() {
  try {
    const state = yield select();
    const { user } = state;
    if (user) {
      yield delay(3000);
      const result = yield call(apiNotification.getBadge, user.id);
      console.log(result);
      if (!result.code) {
        yield put(receivedBadgeStatus(result));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

export function* updateProfile() {
  try {
    const state = yield select();
    const { user } = state;
    if (user) {
      yield delay(3000);
      const result = yield call(apiProfile.get, user.id);
      if (!result.code) {
        yield put(receivedGetProfile(result));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

export function* getAccounts() {
  try {
    const { user } = yield select();
    let isDefaultNull = false;
    if (user) {
      yield delay(2000);
      const defaultAccount = yield call(apiAccount.getDefault, user.id);
      const accounts = yield call(apiAccount.getList, user.id);

      if (!defaultAccount.code) {
        if (!Array.isArray(defaultAccount))
          yield put(receivedGetDefaultAccount(defaultAccount.account));
        else isDefaultNull = true;
      }

      if (!accounts.code) {
        if (isDefaultNull) {
          yield put(receivedGetDefaultAccount(accounts[0]));
        }
        yield put(receivedGetAccount(accounts));
      } else yield put(requestGetAccount());
    }
  } catch (e) {
    console.log(e);
  }
}

export function* getDefaultAccount() {
  try {
    const { user } = yield select();
    if (user) {
      yield delay(3000);
      const result = yield call(apiAccount.getDefault, user.id);
      if (!result.code) {
        yield put(receivedGetDefaultAccount(result));
      } else yield put(requestGetDefaultAccount);
    }
  } catch (e) {
    console.log(e);
  }
}
