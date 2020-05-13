import { api } from './index';

export const apiSetting = {
  getCustomerSettings: (id: string, setting_name: string) =>
    api.get(`/customers/${id}/settings/${setting_name}`, {}),

  setCustomerSettings: (id: string, settings: object) =>
    api.put(`/customers/${id}/settings`, { settings: settings })
};
