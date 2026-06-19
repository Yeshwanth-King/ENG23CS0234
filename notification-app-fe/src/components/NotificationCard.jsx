import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

function formatTime(value) {
  if (!value) {
    return "No time";
  }

  return new Date(value).toLocaleString();
}

export function NotificationCard({ notification, onMarkViewed, showScore = false }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: 4,
        borderLeftColor: notification.isRead ? "grey.300" : "primary.main",
        opacity: notification.isRead ? 0.72 : 1,
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ justifyContent: "space-between" }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", flexWrap: "wrap" }}
              >
                <Chip label={notification.type} color="primary" size="small" />
                <Chip
                  label={notification.isRead ? "Viewed" : "New"}
                  color={notification.isRead ? "default" : "success"}
                  size="small"
                />
                {showScore && (
                  <Chip
                    label={`Score ${Math.round(notification.priorityScore)}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {notification.message}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatTime(notification.timestamp)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="caption" color="text.secondary">
              ID: {notification.id}
            </Typography>
            {!notification.isRead && (
              <Button size="small" onClick={() => onMarkViewed(notification.id)}>
                Mark viewed
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
