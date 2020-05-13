import { apiDebounced } from './index';

export const apiPasscode = {
  createPasscode: (code: string, reset_phone: string, reset_email: string) =>
    apiDebounced.post(`/auth/login/passcode`, {
      code,
      reset_phone,
      reset_email
    }),

  // mode: 'email' or 'phone'
  resetPasscode: (request_id: string, code: string) =>
    apiDebounced.put(`/auth/login/passcode`, { request_id, code }),

  // reset_address might be phone number or email address.
  resetPasscodeRequest: (reset_address: string, phone_number: string) =>
    apiDebounced.post(`/auth/login/passcode/reset`, {
      reset_address,
      phone_number
    }),

  resetPasscodeVerify: (request_id: string, verify_code: string) =>
    apiDebounced.put(`/auth/login/passcode/reset`, { request_id, verify_code }),

  changePasscode: (current_passcode, new_passcode) =>
    apiDebounced.put(`/auth/login/passcode/change`, {
      current_passcode,
      new_passcode
    })
};
