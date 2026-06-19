import { Log } from "../middleware/logger";

export async function fetchNotifications() {
  await Log("frontend", "info", "api", "Fetching notifications");

  return {
    notifications: [],
    total: 0,
  };
}
