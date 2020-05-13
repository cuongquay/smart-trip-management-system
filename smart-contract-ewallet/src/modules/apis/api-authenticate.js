import { api } from './index';

export const apiAuthenticate = {
  loginRequest: ({
    phone_number,
    device_info: { device_type, identifier, notify_id, device_model, device_os }
  }) =>
    api.post('/auth/login', {
      phone_number,
      device_info: {
        device_type,
        identifier,
        notify_id,
        device_model,
        device_os
      }
    }),

  loginVerify: (params: Object) => {
    return api.post('/auth/login/verify', params);
  },

  logout: () => api.post('/auth/logout')
};
