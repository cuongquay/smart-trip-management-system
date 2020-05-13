/**
 * @flow
 * Redux Store configuration for tripcontract.
 * Using redux-persist v5.
 * Feb 9 2018: Updated for react-navigation 1.0.3
 */

'use strict';

import { createStore, applyMiddleware, compose } from 'redux';
import { DeviceEventEmitter } from 'react-native';
import createSagaMiddleware from 'redux-saga';
import { persistCombineReducers, persistStore } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import {
  createReactNavigationReduxMiddleware,
  createReduxBoundAddListener
} from 'react-navigation-redux-helpers';
import { rootReducer } from '../reducers/root-reducer';
import { rootSaga } from '../sagas/root-saga';

const sagaMiddleware = createSagaMiddleware();

// redux-persist v5 configuration:
// Persistor configuration, default is AsyncStorage;
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'config'],
  blacklist: ['navState', 'form']
};

// Reducer, persisted.
const reducers = persistCombineReducers(persistConfig, rootReducer);

const navigationMiddleware = createReactNavigationReduxMiddleware(
  'trip|contract',
  state => {
    return state.navState;
  }
);

export const addListener = createReduxBoundAddListener('trip|contract');

export function configureStore(initialState) {
  const store = createStore(
    reducers,
    initialState,
    compose(applyMiddleware(sagaMiddleware, navigationMiddleware))
  );
  sagaMiddleware.run(rootSaga);

  const persistor = persistStore(store, {}, () =>
    DeviceEventEmitter.emit('PERSIST')
  );

  return { persistor, store };
}
