import qs from 'querystringify';
import _ from 'lodash';
import { getVersion, getBundleId } from 'react-native-device-info';

const Threshold = {
  INTERVAL: 700
};

let authToken = null;
const clientVersion = getVersion;
const bundleId = getBundleId;
let THRESHOLD = Threshold.INTERVAL;

const SERVICE_ENDPOINT_REST_API_URL = __DEV__
  ? 'http://localhost:3000'
  : 'TRIPCONTRACT_API_SERVER_URL';

const SERVICE_SOCKET_IO_URL = __DEV__
  ? 'http://localhost:3000'
  : 'TRIPCONTRACT_SOCKET_IO_URL';

const setToken = (_token: string) => {
  authToken = _token;
};

const setThreshold = (_threshold: number) => {
  THRESHOLD = _threshold;
};

const DEFAULT_HEADERS = {
  'x-client-version': clientVersion(),
  'x-client-bundle': bundleId(),
  'Content-Type': 'application/json',
  'Cache-Control': 'max-age=15',
  Accept: 'application/json',
  Authorization: 'Bearer ' + authToken
};

const MULTIPART_FORM_HEADER = {
  'Content-Type': 'multipart/form-data',
  'Mime-Type': 'jpg|jpeg|png'
};

const api = {
  post: (endpoint: string, params: Object) => {
    let options = {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        ...DEFAULT_HEADERS,
      }
    };
    return fetch(SERVICE_ENDPOINT_REST_API_URL + endpoint, options).then(
      result => result.json()
    );
  },

  get: (endpoint: string, params: Object = {}) => {
    return fetch(
      SERVICE_ENDPOINT_REST_API_URL + endpoint + qs.stringify(params, true),
      {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS
        }
      }
    ).then(result => {
      return result.json();
    });
  },

  put: (endpoint: string, params: Object) => {
    return fetch(SERVICE_ENDPOINT_REST_API_URL + endpoint, {
      method: 'PUT',
      headers: {
        ...DEFAULT_HEADERS
      },
      body: JSON.stringify(params)
    }).then(result => result.json());
  },

  delete: (endpoint: string, params: Object) => {
    return fetch(
      SERVICE_ENDPOINT_REST_API_URL + endpoint + qs.stringify(params, true),
      {
        method: 'DELETE',
        headers: {
          ...DEFAULT_HEADERS
        }
      }
    ).then(result => {
      return result.json();
    });
  },

  postImage: (endpoint: string, params: Object) => {
    let options = {
      method: 'POST',
      body: params,
      headers: {
        ...MULTIPART_FORM_HEADER
      }
    };
    return fetch(SERVICE_ENDPOINT_REST_API_URL + endpoint, options).then(
      result => result.json()
    );
  }
};

const apiDebounced = {
  post: _.debounce(api.post, THRESHOLD, {
    leading: true,
    trailing: false
  }),

  get: _.debounce(api.get, THRESHOLD, {
    leading: true,
    trailing: false
  }),

  put: _.debounce(api.put, THRESHOLD, {
    leading: true,
    trailing: false
  }),

  delete: _.debounce(api.delete, THRESHOLD, {
    leading: true,
    trailing: false
  })
};

export {
  api,
  apiDebounced,
  setToken,
  setThreshold,
  IMAGE_SERVER_URL,
  SERVICE_SOCKET_IO_URL
};
