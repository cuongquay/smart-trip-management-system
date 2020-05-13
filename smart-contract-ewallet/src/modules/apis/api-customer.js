import { apiDebounced, api } from 'apis';

export const apiCustomer = {
  addMoreBalance: (
    id: string,
    amount: number,
    bank_code: string,
    promo_code: string = null
  ) =>
    apiDebounced.post(`/customers/${id}/balances`, {
      amount,
      bank_code,
      promo_code
    }),

  getBalanceStatus: (id: string, trace: string) =>
    api.get(`/customers/${id}/balances/${trace}`),

  getCurrentBalances: (id: string) => api.get(`/customers/${id}/balances`),

  getPromotionCodes: (id: string) => api.get(`/customers/${id}/promocodes`),

  getTransactionDetails: (customer_id: string, tid: string) =>
    api.get(`/customers/${customer_id}/transactions/${tid}`),

  getTransactionList: (page: number, limit: number = 10, customer_id: string) =>
    api.get(`/customers/${customer_id}/transactions`, { limit, page }),

  getCustomerByPhone: (phone: number) =>
    api.get(`/customers/lookup/byphone`, { phone })
};
