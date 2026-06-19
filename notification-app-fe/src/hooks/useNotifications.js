import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { Log } from "../middleware/logger";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data.notifications ?? []);
        setTotal(data.total ?? 0);
        await Log("frontend", "info", "hook", "Notifications loaded");
      } catch (error) {
        await Log(
          "frontend",
          "error",
          "hook",
          `Failed to load notifications: ${error.message}`,
        );
      }
    };

    load();
  }, []);

  const totalPages = 0;

  return { notifications, total, totalPages, loading: false, error: true };
}
