// components/EditAttendanceDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Button,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface EditAttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
}

export default function EditAttendanceDialog({
  open,
  onClose,
  form,
  setForm,
  onSave,
}: EditAttendanceDialogProps) {
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
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", px: 3, pt: 2 }}>
        Edit Attendance
      </DialogTitle>
      <Divider sx={{ mx: 3 }} />

      <DialogContent sx={{ px: 3, py: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={form.date}
            disabled
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
          <TimePicker
            label="Time In"
            value={form.time_in}
            onChange={(newVal) =>
              setForm((f: any) => ({ ...f, time_in: newVal }))
            }
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
          <TimePicker
            label="Time Out"
            value={form.time_out}
            onChange={(newVal) =>
              setForm((f: any) => ({ ...f, time_out: newVal }))
            }
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
        </LocalizationProvider>
      </DialogContent>

      <Divider sx={{ mx: 3 }} />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, px: 3, mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          sx={{ borderRadius: 2, px: 3 }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
