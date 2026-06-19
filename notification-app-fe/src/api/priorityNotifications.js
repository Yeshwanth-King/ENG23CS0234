import { getAccessToken } from "./auth";
import { Log } from "../middleware/logger";

const NOTIFICATION_URL = "/evaluation-service/notifications";

const typeWeight = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function isUnread(notification) {
  const readValue =
    notification.isRead ?? notification.IsRead ?? notification.read ?? false;

  return readValue === false;
}

function getNotificationTime(notification) {
  const time = new Date(notification.Timestamp ?? notification.timestamp).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function getPriorityScore(notification) {
  const weight = typeWeight[notification.Type ?? notification.type] ?? 0;
  const notificationTime = getNotificationTime(notification);
  const ageInHours = Math.max((Date.now() - notificationTime) / 36e5, 0);
  const recencyScore = Math.max(100 - ageInHours, 0);

  return weight * 100 + recencyScore;
}

export function getTopPriorityNotifications(notifications, limit = 10) {
  return notifications
    .filter(isUnread)
    .map((notification) => ({
      ...notification,
      priorityScore: getPriorityScore(notification),
    }))
    .sort((first, second) => {
      if (second.priorityScore !== first.priorityScore) {
        return second.priorityScore - first.priorityScore;
      }

      return getNotificationTime(second) - getNotificationTime(first);
    })
    .slice(0, limit);
}

export async function fetchTopPriorityNotifications(limit = 10) {
  await Log("frontend", "info", "api", "Fetching notifications for priority inbox");

  const token = await getAccessToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(NOTIFICATION_URL, { headers });

  if (!response.ok) {
    await Log(
      "frontend",
      "error",
      "api",
      `Failed to fetch priority notifications. Status: ${response.status}`,
    );
    throw new Error("Failed to fetch notifications");
  }

  const data = await response.json();
  const notifications = data.notifications ?? [];
  const priorityNotifications = getTopPriorityNotifications(notifications, limit);

  await Log(
    "frontend",
    "info",
    "api",
    `Priority inbox prepared with ${priorityNotifications.length} notifications`,
  );

  return priorityNotifications;
}

export function addNotificationToPriorityList(currentList, newNotification, limit = 10) {
  return getTopPriorityNotifications([...currentList, newNotification], limit);
}
