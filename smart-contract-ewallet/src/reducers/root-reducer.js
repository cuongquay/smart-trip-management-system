import { reducer as formReducer } from 'redux-form';
import { navState } from './navigation';
import { common } from './common';
import { config } from './config';
import { user } from './user';

const rootReducer = {
  form: formReducer,
  navState,
  common,
  config,
  user
};

export { rootReducer };
