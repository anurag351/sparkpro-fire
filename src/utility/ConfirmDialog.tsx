// src/components/common/ConfirmDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: 6, padding: 3 },
      }}
    >
      {/* Header with border */}
      <DialogTitle sx={{ borderBottom: "1px solid #ddd", fontWeight: "600" }}>
        {title}
      </DialogTitle>

      {/* Body */}
      <DialogContent dividers>
        <DialogContentText sx={{ whiteSpace: "pre-line", fontSize: "1rem" }}>
          {message}
        </DialogContentText>
      </DialogContent>

      {/* Footer with border */}
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {loading ? "Processing..." : "OK"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
