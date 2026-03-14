"use client";

import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        background: {
          body: "#0f0f1a",
          surface: "#1a1a2e",
        },
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
        },
      },
    },
  },
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
