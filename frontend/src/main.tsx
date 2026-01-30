import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ColorModeProvider } from "./contexts/ColorModeContext";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <ColorModeProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </BrowserRouter>
        </LocalizationProvider>
      </ColorModeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
