import { api } from './index';

export const apiInsights = {
  getNews: (id: string) => {
    return api.get(`/customers/${id}/insights/news`);
  }
};
