import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

type ColorMode = "light" | "dark";

type ColorModeContextValue = {
  mode: ColorMode;
  toggle: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | undefined>(
  undefined,
);

const getInitialMode = (): ColorMode => {
  const stored = localStorage.getItem("theme_mode");
  return stored === "dark" ? "dark" : "light";
};

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem("theme_mode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#0f766e" },
          secondary: { main: "#1d4ed8" },
          background:
            mode === "light"
              ? { default: "#f4f6fb", paper: "#ffffff" }
              : { default: "#0b0f13", paper: "#111827" },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
        },
      }),
    [mode],
  );

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggle: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return ctx;
}
