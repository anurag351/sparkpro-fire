import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  MenuItem,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (filters: {
    startDate: string;
    endDate: string;
    status: string;
  }) => Promise<void>; // async support for finally
}

export default function ExportDialog({
  open,
  onClose,
  onExport,
}: ExportDialogProps) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [status, setStatus] = useState<string>("");
  const [errors, setErrors] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  // --- Clear form fields ---
  const clearForm = () => {
    setStartDate(null);
    setEndDate(null);
    setStatus("");
    setErrors({});
  };

  // --- Validate and Export ---
  const handleExportClick = async () => {
    const newErrors: { startDate?: string; endDate?: string } = {};

    if (!startDate) newErrors.startDate = "Start Date is required";
    if (!endDate) newErrors.endDate = "End Date is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await onExport({
        startDate: startDate ? startDate?.format("YYYY-MM-DD") : "",
        endDate: endDate ? endDate?.format("YYYY-MM-DD") : "",
        status,
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      clearForm(); // always clear form after API call
      setLoading(false);
      onClose(); // also close the dialog
    }
  };

  return (
    <Dialog open={open} onClose={onClose} sx={{ p: 3, borderRadius: 3 }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Export</DialogTitle>
      <Divider sx={{ ml: 3, mr: 3 }} />

      <DialogContent sx={{ p: 3 }}>
        <Typography>Please Enter Start Date And End Date</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)", // 4 equal columns
              gap: 5, // space between columns
              mt: 3,
            }}
          >
            {/* Start Date */}
            <DatePicker
              label="Start Date *"
              value={startDate}
              onChange={(val) => {
                setStartDate(val);
                setErrors((e) => ({ ...e, startDate: "" }));
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: Boolean(errors.startDate),
                  helperText: errors.startDate,
                },
              }}
            />

            {/* End Date */}
            <DatePicker
              label="End Date *"
              value={endDate}
              onChange={(val) => {
                setEndDate(val);
                setErrors((e) => ({ ...e, endDate: "" }));
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: Boolean(errors.endDate),
                  helperText: errors.endDate,
                },
              }}
            />

            {/* Status Dropdown */}
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Stage 1 Approved">Stage 1 Approved</MenuItem>
            </TextField>
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <Divider sx={{ ml: 3, mr: 3 }} />

      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" sx={{ borderRadius: 4 }} onClick={clearForm}>
          Clear All
        </Button>
        <Button variant="outlined" sx={{ borderRadius: 4 }} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ borderRadius: 4 }}
          onClick={handleExportClick}
          disabled={loading}
        >
          {loading ? "Exporting..." : "Export"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
