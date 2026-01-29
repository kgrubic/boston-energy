import ContractsPage from "./pages/ContractsPage";
import PortfolioPage from "./pages/PortfolioPage";
import ContractDetailsPage from "./pages/ContractDetailsPage";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import {
  Alert,
  AppBar,
  Box,
  Container,
  Snackbar,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "./contexts/NotificationContext";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabIndex = location.pathname.startsWith("/portfolio") ? 1 : 0;
  const { notifications, remove } = useNotifications();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(15, 118, 110, 0.12), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        py: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            mb: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
            <BoltRoundedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
              Boston Energy
            </Typography>
            <Tabs
              value={tabIndex}
              onChange={(_, value) =>
                navigate(value === 0 ? "/" : "/portfolio")
              }
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ minHeight: 36 }}
            >
              <Tab label="Contracts" sx={{ minHeight: 36 }} />
              <Tab label="Portfolio" sx={{ minHeight: 36 }} />
            </Tabs>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<ContractsPage title="Available Contracts" />} />
          <Route path="/contract/:contractId" element={<ContractDetailsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </Container>
      {notifications.map((note, index) => (
        <Snackbar
          key={note.id}
          open
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          onClose={() => remove(note.id)}
          autoHideDuration={5000}
          sx={{ bottom: 24 + index * 72 }}
        >
          <Alert
            severity={note.severity}
            variant="filled"
            onClose={() => remove(note.id)}
          >
            {note.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}
