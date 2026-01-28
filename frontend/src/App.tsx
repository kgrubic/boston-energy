import ContractsPage from "./pages/ContractsPage";
import { useState } from "react";
import PortfolioPage from "./pages/PortfolioPage";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";

export default function App() {
  const [tab, setTab] = useState<"contracts" | "portfolio">("contracts");
  const tabIndex = tab === "contracts" ? 0 : 1;

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
                setTab(value === 0 ? "contracts" : "portfolio")
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
        {tab === "contracts" ? <ContractsPage /> : <PortfolioPage />}
      </Container>
    </Box>
  );
}
