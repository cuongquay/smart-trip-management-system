import Types from './types';

export function setLanguage(language) {
  console.log({
    type: Types.SET_LANGUAGE,
    language
  });
  return {
    type: Types.SET_LANGUAGE,
    language
  };
}
