import { api } from './index';

export const apiNotification = {
  getNotifications: (id: string, limit: string, page: string) =>
    api.get(`/customers/${id}/notifications`, { limit, page }),

  getNotificationsDetail: (id: string, notify_id: string) =>
    api.get(`/customers/${id}/notifications/${notify_id}`, {}),

  deleteNotification: (id: string, notify_id: string) =>
    api.delete(`/customers/${id}/notifications/${notify_id}`, {}),

  deleteAllNotification: (id: string) =>
    api.delete(`/customers/${id}/notifications`, {}),

  markAllAsRead: () => api.put(`/customers/notifications/read`, {}),

  getBadge: (id: string) => api.get(`/customers/${id}/notifications/status`)
};
