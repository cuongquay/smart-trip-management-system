import I18n from 'react-native-i18n';
import { store } from 'app';
import { setLanguage } from 'actions/actions-config';

import en from './languages/en.json';
import vi from './languages/vi.json';

I18n.fallbacks = true;
I18n.defaultLocale = 'vi';

function switchLanguage(locale = 'vi') {
  console.log(locale);
  I18n.defaultLocale = locale;
  store.dispatch(setLanguage(locale));
}

I18n.translations = {
  en,
  vi
};

export { I18n, switchLanguage };
