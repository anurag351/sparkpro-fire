// components/shared/RejectDialog.tsx
import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Button,
  TextField,
} from "@mui/material";

interface RejectDialogProps {
  open: boolean;
  title?: string;
  review_comment: string;
  setComment: (value: string) => void;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function RejectDialog({
  open,
  title = "Reject Attendance",
  review_comment,
  setComment,
  onClose,
  onConfirm,
}: RejectDialogProps) {
  useEffect(() => {
    if (!open) {
      setComment("");
    }
  }, [open, setComment]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": { borderRadius: 3, p: 1 },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", px: 3, pt: 2 }}>
        {title}
      </DialogTitle>

      <Divider sx={{ mx: 3 }} />

      {/* Body */}
      <DialogContent sx={{ px: 3, py: 2 }}>
        <TextField
          label="Please add review comment"
          multiline
          rows={4}
          fullWidth
          value={review_comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>

      <Divider sx={{ mx: 3 }} />

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, px: 3, mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}
