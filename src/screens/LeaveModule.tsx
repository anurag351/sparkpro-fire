import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Divider,
  TextField,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Navigation from "../components/Navigation";

interface LeaveForm {
  start_date: Dayjs | null;
  end_date: Dayjs | null;
  reason: string;
}

interface LeaveRecord {
  id: string;
  start_date: string;
  end_date: string;
  status: "Pending" | "Approved" | "Rejected";
  review_comment?: string;
}

export default function LeaveModule() {
  const [form, setForm] = useState<LeaveForm>({
    start_date: null,
    end_date: null,
    reason: "",
  });

  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [exportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>({ start: null, end: null });

  useEffect(() => {
    // TODO: Fetch leaves from API
    setLeaves([
      {
        id: "1",
        start_date: "2025-09-20",
        end_date: "2025-09-22",
        status: "Pending",
        review_comment: "Need clarification",
      },
      {
        id: "2",
        start_date: "2025-09-25",
        end_date: "2025-09-26",
        status: "Approved",
        review_comment: "Enjoy your leave",
      },
    ]);
  }, []);
  const clearAll = () => {
    setForm({ start_date: null, end_date: null, reason: "" });
    setEditId(null);
  };

  const handleApply = async () => {
    if (!form.start_date || !form.end_date) {
      setToast({
        open: true,
        type: "error",
        msg: "Please select both start and end date",
      });
      return;
    }

    const payload = {
      start_date: form.start_date.format("YYYY-MM-DD"),
      end_date: form.end_date.format("YYYY-MM-DD"),
    };

    try {
      if (editId) {
        // Update leave API
        console.log("Updating leave:", editId, payload);
      } else {
        // Create leave API
        console.log("Creating leave:", payload);
      }

      setToast({
        open: true,
        type: "success",
        msg: editId
          ? "Leave updated successfully"
          : "Leave applied successfully",
      });
      clearAll();
      setEditOpen(false);
      // Refresh leave list (TODO: fetch from API)
    } catch (err) {
      setToast({
        open: true,
        type: "error",
        msg: "Failed to apply/update leave",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      // Call delete API
      console.log("Deleting leave:", deleteId);
      setToast({
        open: true,
        type: "success",
        msg: "Leave deleted successfully",
      });
      setLeaves((prev) => prev.filter((l) => l.id !== deleteId));
    } catch {
      setToast({
        open: true,
        type: "error",
        msg: "Delete failed",
      });
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const columns: GridColDef[] = [
    { field: "start_date", headerName: "Start Date", flex: 1 },
    { field: "end_date", headerName: "End Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "review_comment", headerName: "Review Comment", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => {
        const row = params.row as LeaveRecord;
        if (row.status !== "Approved") {
          return (
            <Box>
              <IconButton
                onClick={() => {
                  setEditId(row.id);
                  setForm({
                    start_date: dayjs(row.start_date),
                    end_date: dayjs(row.end_date),
                    reason: form.reason,
                  });
                  setEditOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteClick(row.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        }
        return null;
      },
    },
  ];

  return (
    <>
      <Navigation />
      <Card
        elevation={8}
        sx={{
          zIndex: 1200,
          m: 3,
          p: 3,
          borderRadius: 2,
          width: "90%",
          mx: "auto",
          mt: 5,
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Apply for Leave
          </Typography>

          {/* Leave Form */}
          <Box sx={{ display: "flex", gap: 3, mt: 5 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={form.start_date}
                onChange={(newVal) =>
                  setForm((f) => ({ ...f, start_date: newVal }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={form.end_date}
                onChange={(newVal) =>
                  setForm((f) => ({ ...f, end_date: newVal }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
          {/* Reason Field */}
          <Box sx={{ mt: 3 }}>
            <TextField
              label="Reason"
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              fullWidth
              multiline
              minRows={2}
            />
          </Box>
          {/* Buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 5 }}
          >
            <Button
              variant="outlined"
              onClick={clearAll}
              sx={{ borderRadius: 3 }}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              sx={{ borderRadius: 3 }}
            >
              {editId ? "Update" : "Apply"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setExportOpen(true)}
              sx={{ borderRadius: 3 }}
            >
              Export
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Leave Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Leave</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={form.start_date}
              onChange={(newVal) =>
                setForm((f) => ({ ...f, start_date: newVal }))
              }
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={form.end_date}
              onChange={(newVal) =>
                setForm((f) => ({ ...f, end_date: newVal }))
              }
              slotProps={{ textField: { fullWidth: true, sx: { mt: 3 } } }}
            />
          </LocalizationProvider>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleApply} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Typography>
            Are you sure you want to delete this leave request?
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined">
            No
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        elevation={8}
        sx={{
          zIndex: 1200,
          m: 3,
          p: 3,
          borderRadius: 2,
          width: "90%",
          mx: "auto",
          mt: 5,
        }}
      >
        <CardContent>
          {/* Table */}
          <Box sx={{ height: 400, mt: 5 }}>
            <DataGrid
              rows={leaves}
              columns={columns}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              sx={{
                borderLeft: "none",
                borderRight: "none",
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Toast */}
      <Snackbar
        open={!!toast?.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => (t ? { ...t, open: false } : null))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert
            severity={toast.type}
            onClose={() => setToast(null)}
            sx={{ width: "100%" }}
          >
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
