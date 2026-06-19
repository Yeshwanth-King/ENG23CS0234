import { getAccessToken } from "./auth";
import { Log } from "../middleware/logger";

const NOTIFICATION_URL = "/evaluation-service/notifications";

export function normalizeNotification(notification) {
  return {
    id: notification.ID ?? notification.id,
    type: notification.Type ?? notification.type,
    message: notification.Message ?? notification.message,
    timestamp: notification.Timestamp ?? notification.timestamp,
  };
}

export async function fetchNotifications({ page = 1, limit = 10, type } = {}) {
  await Log("frontend", "info", "api", "Fetching notifications");

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (type && type !== "All") {
    params.set("notification_type", type);
  }

  const token = await getAccessToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${NOTIFICATION_URL}?${params.toString()}`, {
    headers,
  });

  if (!response.ok) {
    await Log(
      "frontend",
      "error",
      "api",
      `Notification API failed with status ${response.status}`,
    );
    throw new Error("Could not load notifications");
  }

  const data = await response.json();
  const notifications = (data.notifications ?? []).map(normalizeNotification);

  return {
    notifications,
    total: data.total ?? notifications.length,
    totalPages: data.totalPages,
  };
}
