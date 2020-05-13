import { api } from './index';

export const apiProfile = {
  uploadImage: (id: string, data) =>
    api.postImage(`/customers/${id}/profile/upload`, data),

  get: (id: string) => api.get(`/customers/${id}/profile`, {}),

  update: (
    id: string,
    avatar_img: string,
    full_name: string,
    reset_email: string,
    reset_phone: string,
    birthday: string,
    identity_card: string,
    identity_image: string
  ) =>
    api.put(`/customers/${id}/profile`, {
      avatar_img,
      full_name,
      reset_email,
      reset_phone,
      birthday,
      identity_card,
      identity_image
    }),
  getUserOneTimeCode: (id: string) =>
    api.get(`/customers/${id}/profile/qrcode`, {})
};
