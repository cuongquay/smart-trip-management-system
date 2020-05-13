/**
 * @flow
 * Various action creator for common use cases.
 */

'use strict';

import Types from './types';

export function setLoading(loading: boolean = true) {
  return {
    type: Types.SET_LOADING,
    loading
  };
}

export function showModal(showModal: boolean = true) {
  return {
    type: Types.SHOW_UPDATE_MODAL,
    showModal
  };
}
