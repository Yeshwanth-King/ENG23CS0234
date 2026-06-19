import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { getTopPriorityNotifications } from "../api/priorityNotifications";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";

export default function PriorityNotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(10);

  const { notifications, loading, error, markAsViewed } = useNotifications({
    page: 1,
    limit,
    type: filter,
  });

  const priorityNotifications = useMemo(
    () => getTopPriorityNotifications(notifications, limit),
    [notifications, limit],
  );

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <PriorityHighIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Priority Inbox
            </Typography>
            <Typography color="text.secondary">
              Top unread notifications based on type and latest time.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        sx={{ justifyContent: "space-between" }}
      >
        <NotificationFilter value={filter} onChange={setFilter} />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="priority-limit-label">Show Top</InputLabel>
          <Select
            labelId="priority-limit-label"
            label="Show Top"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            {[10, 15, 25].map((value) => (
              <MenuItem key={value} value={value}>
                Top {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && priorityNotifications.length === 0 && (
        <Alert severity="info">No unread priority notifications found.</Alert>
      )}

      {!loading && !error && priorityNotifications.length > 0 && (
        <Stack spacing={1.5}>
          {priorityNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkViewed={markAsViewed}
              showScore
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
