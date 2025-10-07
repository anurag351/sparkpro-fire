// components/shared/ConfirmDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Typography,
  Button,
  Slide,
  Grow,
  Fade,
  CircularProgress,
} from "@mui/material";
import { forwardRef, ReactNode } from "react";

type TransitionType = "slide" | "grow" | "fade";

const SlideUp = forwardRef(function SlideUp(props: any, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const GrowIn = forwardRef(function GrowIn(props: any, ref) {
  return <Grow ref={ref} {...props} />;
});
const FadeIn = forwardRef(function FadeIn(props: any, ref) {
  return <Fade ref={ref} {...props} />;
});

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "error" | "secondary";
  icon?: ReactNode;
  transition?: TransitionType;
  loading?: boolean; // 🔹 NEW
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Yes",
  cancelText = "No",
  confirmColor = "primary",
  icon,
  transition = "slide",
  loading = false,
}: ConfirmDialogProps) {
  const TransitionComponent =
    transition === "grow" ? GrowIn : transition === "fade" ? FadeIn : SlideUp;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={TransitionComponent}
      keepMounted
      maxWidth="xs"
      fullWidth
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          pb: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {icon}
        {title}
      </DialogTitle>
      <Divider sx={{ mx: 2 }} />

      {/* Body */}
      <DialogContent sx={{ py: 3 }}>
        <Typography align="center" sx={{ fontSize: "0.95rem" }}>
          {message}
        </Typography>
      </DialogContent>
      <Divider sx={{ mx: 2 }} />

      {/* Footer */}
      <DialogActions
        sx={{
          justifyContent: "center",
          gap: 2,
          py: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ px: 3, borderRadius: 2 }}
          disabled={loading} // 🔹 Disable cancel while loading
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          sx={{ px: 4, borderRadius: 2, position: "relative" }}
          disabled={loading} // 🔹 Prevent multiple clicks
        >
          {loading ? (
            <CircularProgress
              size={22}
              sx={{
                color: "white",
              }}
            />
          ) : (
            confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
