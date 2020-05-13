import { apiDebounced, api } from 'apis';
import geolib from 'geolib';

export const getDistance = (latitude1, longitude1, latitude2, longitude2) => {
  let distance = geolib.getDistanceSimple(
    { latitude: latitude1, longitude: longitude1 },
    { latitude: latitude2, longitude: longitude2 }
  );

  distance = geolib.convertUnit('km', distance, 2);

  const result = {
    originalValue: distance,
    value: distance < 1 ? distance * 1000 : distance,
    unit: distance < 1 ? 'm' : 'km'
  };

  return result;
};

export const apiMerchant = {
  getMerchantByCode: (code: string) =>
    apiDebounced.get(`/merchants/lookup/bycode`, { code }),

  getMerchantById: (id: string) => apiDebounced.get(`/merchants/${id}`),

  getMerchantByPhone: (phone: string) =>
    apiDebounced.get(`/merchants/lookup/byphone`, { phone }),

  getMerchantList: (district: string = '') =>
    apiDebounced.get(`/merchants`, { district }),

  getMerchantsNearby: (params: Object) => {
    // { lat, long, range, limit }
    console.log(params);
    return api.get(`/merchants/locations/nearby`, params);
  }
};

export const GOOGLE_PLACE_API_KEY = __DEV__
  ? 'AIzaSyAp1ZuQxLGtf-c1ng-JAfFKE3VGxtg2Q1Y'
  : 'AIzaSyDdBd_9a4v5nuqANkE1fyC3hhK5z2TvC5g';

const GOOGLE_DIRECTIONS = `https://maps.googleapis.com/maps/api/directions/json?key=${GOOGLE_PLACE_API_KEY}`;

export const apiGeolocation = {
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log(position);
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        error => reject(error),
        { enableHighAccuracy: false, timeout: 7000, maximumAge: 5000 }
      );
    });
  },

  // Available modes: driving, walking, bicyling, transit
  getDirections: (lat1, lng1, lat2, lng2, mode = 'walking') => {
    return fetch(
      `${GOOGLE_DIRECTIONS}&origin=${lat1},${lng1}&destination=${lat2},${lng2}&mode=${mode}`
    ).then(result => result.json());
  }
};
