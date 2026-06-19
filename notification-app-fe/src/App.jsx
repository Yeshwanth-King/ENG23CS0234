import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import NotificationsPage from "./pages/NotificationsPage";
import PriorityNotificationsPage from "./pages/PriorityNotificationsPage";
import { Log } from "./middleware/logger";

export default function App() {
  const [page, setPage] = useState("all");

  useEffect(() => {
    Log("frontend", "info", "component", `Opened ${page} notifications page`);
  }, [page]);

  return (
    <>
      <CssBaseline />
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              width: "100%",
              py: { xs: 1, sm: 0 },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Campus Notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All updates and priority inbox
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant={page === "all" ? "contained" : "outlined"}
                onClick={() => setPage("all")}
              >
                All
              </Button>
              <Button
                variant={page === "priority" ? "contained" : "outlined"}
                onClick={() => setPage("priority")}
              >
                Priority
              </Button>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        {page === "all" ? <NotificationsPage /> : <PriorityNotificationsPage />}
      </Container>
    </>
  );
}