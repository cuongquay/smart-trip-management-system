import { api } from './index';

export const apiAccount = {
  getList: (id: string) =>
    api.get(`/customers/${id}/accounts`, {
      type_code: 'spending'
    }),

  getDefault: (id: string) =>
    api.get(`/customers/${id}/default-account`, {
      activity: 'all',
      limit: 1,
      includes: 'account'
    })
};
