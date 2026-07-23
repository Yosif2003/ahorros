import { apiFetch } from '../../services/api';
import type { AppNotification } from '../../types/notifications';

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    return await apiFetch<AppNotification[]>('/notifications', {
      method: 'GET',
    });
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    return await apiFetch<AppNotification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }
};