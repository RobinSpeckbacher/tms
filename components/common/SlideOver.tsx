"use client";

import { type ReactNode, useState, useCallback } from "react";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";

const DURATION = 250;

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  width?: number | string;
}

export default function SlideOver({
  open,
  onClose,
  title,
  children,
  actions,
  width = 420,
}: SlideOverProps) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  // open went true → show immediately
  if (open && !visible) {
    setVisible(true);
    setClosing(false);
  }

  // open went false externally → trigger close animation
  if (!open && visible && !closing) {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setVisible(false);
    }, DURATION);
  }

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setVisible(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={handleClose}
      style={{
        backgroundColor: closing ? "transparent" : "rgba(0,0,0,0.3)",
        transition: `background-color ${DURATION}ms ease`,
      }}
    >
      <Box
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        sx={{
          width: "100%",
          maxWidth: width,
          height: "100%",
          bgcolor: "#fff",
          borderLeft: "1px solid #d5dbe8",
          boxShadow: "lg",
          display: "flex",
          flexDirection: "column",
          animation: closing
            ? `slideOutRight ${DURATION}ms ease-in forwards`
            : `slideInRight ${DURATION}ms ease-out`,
          "@keyframes slideInRight": {
            from: { transform: "translateX(100%)" },
            to: { transform: "translateX(0)" },
          },
          "@keyframes slideOutRight": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(100%)" },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Typography level="title-sm" sx={{ color: "#0f172b" }}>
            {title}
          </Typography>
          <IconButton
            size="sm"
            variant="plain"
            onClick={handleClose}
            sx={{ color: "#57688e" }}
          >
            <span className="text-lg leading-none">×</span>
          </IconButton>
        </Box>
        <Divider />

        {/* Body */}
        <Box sx={{ flex: 1, overflow: "auto", px: 2.5, py: 2 }}>{children}</Box>

        {/* Actions */}
        {actions && (
          <>
            <Divider />
            <Stack
              direction="row"
              spacing={1}
              sx={{
                px: 2.5,
                py: 1.5,
                justifyContent: "flex-end",
                flexShrink: 0,
              }}
            >
              {actions}
            </Stack>
          </>
        )}
      </Box>
    </div>
  );
}
