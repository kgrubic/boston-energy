import { useEffect, useState } from "react";
import ContractsPage from "./pages/ContractsPage";
import PortfolioPage from "./pages/PortfolioPage";
import ContractDetailsPage from "./pages/ContractDetailsPage";
import HomePage from "./pages/HomePage";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import LoginPage from "./pages/LoginPage";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Snackbar,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useNotifications } from "./contexts/NotificationContext";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(
    Boolean(localStorage.getItem("auth_token")),
  );
  const tabIndex = location.pathname.startsWith("/portfolio")
    ? 1
    : location.pathname.startsWith("/contracs")
      ? 0
      : false;
  const { notifications, remove } = useNotifications();

  useEffect(() => {
    const handler = () =>
      setIsAuthed(Boolean(localStorage.getItem("auth_token")));
    window.addEventListener("auth-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("auth-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.dispatchEvent(new Event("auth-change"));
    if (location.pathname.startsWith("/portfolio")) {
      navigate("/");
    }
  };

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
            <Typography
              component={RouterLink}
              to="/"
              variant="h6"
              sx={{
                fontWeight: 700,
                flexGrow: 1,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Boston Energy
            </Typography>
            <Tabs
              value={tabIndex}
              onChange={(_, value) =>
                navigate(value === 0 ? "/contracs" : "/portfolio")
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
            {isAuthed ? (
              <Button size="small" variant="outlined" onClick={handleLogout}>
                Log out
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/contracs"
            element={<ContractsPage title="Available Contracts" />}
          />
          <Route
            path="/contracs/:contractId"
            element={<ContractDetailsPage />}
          />
          <Route
            path="/contracts"
            element={<Navigate to="/contracs" replace />}
          />
          <Route
            path="/contract/:contractId"
            element={<Navigate to="/contracs/:contractId" replace />}
          />
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
