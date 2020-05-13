import _ from 'lodash';
import { takeLatest } from 'redux-saga/effects';
import Types from 'actions/types';
import {
  updateUserBalance,
  updateBadgeStatus,
  updateProfile,
  getAccounts,
  getDefaultAccount
} from './user-saga';

const debounced = _.debounce(updateUserBalance, 3000);

export function* rootSaga() {
  yield [
    takeLatest(Types.REQUEST_USER_BALANCE, updateUserBalance),
    takeLatest(Types.REQUEST_BADGE_STATUS, updateBadgeStatus),
    takeLatest(Types.REQUEST_GET_PROFILE, updateProfile),
    takeLatest(Types.REQUEST_GET_ACCOUNTS, getAccounts),
    takeLatest(Types.REQUEST_GET_DEFAULT_ACCOUNTS, getDefaultAccount),
    takeLatest('Navigation/RESET', debounced),
    takeLatest('Navigation/BACK', debounced)
  ];
}
