import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import { Log } from "../middleware/logger";

const VIEWED_KEY = "viewed_notification_ids";
const API_PAGE_LIMIT = 10;

function readViewedIds() {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function useNotifications({ page = 1, limit = 10, type = "All" } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewedIds, setViewedIds] = useState(readViewedIds);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        let data;

        if (limit > API_PAGE_LIMIT) {
          const pageCount = Math.ceil(limit / API_PAGE_LIMIT);
          const results = await Promise.all(
            Array.from({ length: pageCount }, (_, index) =>
              fetchNotifications({
                page: index + 1,
                limit: API_PAGE_LIMIT,
                type,
              }),
            ),
          );

          const mergedNotifications = Array.from(
            new Map(
              results
                .flatMap((result) => result.notifications)
                .map((notification) => [notification.id, notification]),
            ).values(),
          );

          data = {
            notifications: mergedNotifications,
            total: mergedNotifications.length,
            totalPages: 1,
          };
        } else {
          data = await fetchNotifications({ page, limit, type });
        }

        if (ignore) {
          return;
        }

        setNotifications(data.notifications);
        setTotal(data.total);
        setTotalPages(
          data.totalPages ??
            Math.max(page + (data.notifications.length === limit ? 1 : 0), 1),
        );
        await Log("frontend", "info", "hook", "Notifications loaded");
      } catch (error) {
        if (ignore) {
          return;
        }

        setError(error.message);
        await Log(
          "frontend",
          "error",
          "hook",
          `Failed to load notifications: ${error.message}`,
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [page, limit, type]);

  const markAsViewed = async (id) => {
    if (!id || viewedIds.includes(id)) {
      return;
    }

    const nextIds = [...viewedIds, id];
    setViewedIds(nextIds);
    localStorage.setItem(VIEWED_KEY, JSON.stringify(nextIds));
    await Log("frontend", "info", "state", `Notification marked viewed: ${id}`);
  };

  const notificationsWithStatus = notifications.map((notification) => ({
    ...notification,
    isRead: viewedIds.includes(notification.id),
  }));

  const unreadCount = notificationsWithStatus.filter(
    (notification) => !notification.isRead,
  ).length;

  return {
    notifications: notificationsWithStatus,
    total,
    totalPages,
    unreadCount,
    loading,
    error,
    viewedIds,
    markAsViewed,
  };
}
