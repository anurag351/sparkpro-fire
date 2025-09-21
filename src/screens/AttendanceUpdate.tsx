import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Edit, Delete, GetApp } from "@mui/icons-material";
import Navigation from "../components/Navigation";

interface EmployeeInfo {
  id: string;
  name: string;
  role: string;
}

interface AttendanceForm {
  id?: number;
  date: Dayjs | null;
  time_in: Dayjs | null;
  time_out: Dayjs | null;
}

interface AttendanceRow {
  id: number;
  date: string;
  time_in: string;
  time_out: string;
  status: string;
  review_comment: string;
}

export default function AttendanceUpdate() {
  const [employee, setEmployee] = useState<EmployeeInfo>({
    id: "EMP001",
    name: "John Doe",
    role: "Employee",
  });

  const [form, setForm] = useState<AttendanceForm>({
    date: dayjs(),
    time_in: null,
    time_out: null,
  });

  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false); // NEW for Edit Popup
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    // Fetch employee info
    setEmployee({
      id: "EMP001",
      name: "John Doe",
      role: "Employee",
    });

    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    // TODO: replace with your real API
    const res = await fetch(`/attendance/employee/${employee.id}`);
    if (res.ok) {
      const data = await res.json();
      setAttendanceData(data);
    }
  };

  const clearAll = () => {
    setForm({ date: dayjs(), time_in: null, time_out: null });
  };

  // CREATE NEW ATTENDANCE
  const handleSubmit = async () => {
    if (!form.date || !form.time_in || !form.time_out) {
      setToast({
        open: true,
        type: "error",
        msg: "Please fill all fields",
      });
      return;
    }

    try {
      const payload = {
        employee_id: employee.id,
        date: form.date.format("YYYY-MM-DD"),
        time_in: form.time_in.format("HH:mm:ss"),
        time_out: form.time_out.format("HH:mm:ss"),
      };

      const res = await fetch("/attendance/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      setToast({
        open: true,
        type: "success",
        msg: "Attendance Created Successfully",
      });
      clearAll();
      fetchAttendance();
    } catch {
      setToast({
        open: true,
        type: "error",
        msg: "Failed to Save Attendance",
      });
    }
  };

  // OPEN EDIT POPUP
  const handleEdit = (row: AttendanceRow) => {
    setForm({
      id: row.id,
      date: dayjs(row.date),
      time_in: dayjs(row.time_in, "HH:mm:ss"),
      time_out: dayjs(row.time_out, "HH:mm:ss"),
    });
    setEditOpen(true);
  };

  // SAVE EDIT
  const handleEditSave = async () => {
    if (!form.id || !form.date || !form.time_in || !form.time_out) return;

    try {
      const payload = {
        employee_id: employee.id,
        date: form.date.format("YYYY-MM-DD"), // still required
        time_in: form.time_in.format("HH:mm:ss"),
        time_out: form.time_out.format("HH:mm:ss"),
      };

      const res = await fetch(`/attendance/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      setToast({
        open: true,
        type: "success",
        msg: "Attendance Updated Successfully",
      });
      setEditOpen(false);
      clearAll();
      fetchAttendance();
    } catch {
      setToast({
        open: true,
        type: "error",
        msg: "Failed to Update Attendance",
      });
    }
  };

  // DELETE
  // --- Add State ---
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // --- Modify handleDelete ---
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/attendance/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setToast({ open: true, type: "success", msg: "Deleted Successfully" });
      fetchAttendance();
    } catch {
      setToast({ open: true, type: "error", msg: "Delete Failed" });
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  // EXPORT
  const handleExport = async () => {
    if (!startDate || !endDate) {
      setToast({ open: true, type: "error", msg: "Please select dates" });
      return;
    }

    try {
      const res = await fetch(
        `/attendance/export?employee_id=${employee.id}&start=${startDate.format(
          "YYYY-MM-DD"
        )}&end=${endDate.format("YYYY-MM-DD")}`
      );
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "attendance.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExportOpen(false);
    } catch {
      setToast({ open: true, type: "error", msg: "Export Failed" });
    }
  };

  return (
    <>
      <Navigation />

      {/* Top Card */}
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
            Update My Attendance
          </Typography>

          {/* Static Employee Info */}
          <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
            <Typography>
              <strong>Employee ID:</strong> {employee.id}
            </Typography>
            <Typography>
              <strong>Name:</strong> {employee.name}
            </Typography>
            <Typography>
              <strong>Role:</strong> {employee.role}
            </Typography>
          </Box>

          {/* Attendance Fields */}
          <Box sx={{ display: "flex", gap: 3, mt: 5 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={form.date}
                onChange={(newVal) => setForm((f) => ({ ...f, date: newVal }))}
                slotProps={{ textField: { fullWidth: true } }}
              />

              <TimePicker
                label="Time In"
                value={form.time_in}
                onChange={(newVal) =>
                  setForm((f) => ({ ...f, time_in: newVal }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />

              <TimePicker
                label="Time Out"
                value={form.time_out}
                onChange={(newVal) =>
                  setForm((f) => ({ ...f, time_out: newVal }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>

          {/* Buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 5 }}
          >
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => setExportOpen(true)}
              sx={{ borderRadius: 3 }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              onClick={clearAll}
              sx={{ borderRadius: 3 }}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ borderRadius: 3 }}
            >
              Save
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card
        elevation={2}
        sx={{
          zIndex: 1200,
          mt: 0,
          p: 3,
          borderRadius: 2,
          width: "90%",
          mx: "auto",
        }}
      >
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time In</TableCell>
                  <TableCell>Time Out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Review Comment</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.time_in}</TableCell>
                    <TableCell>{row.time_out}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.review_comment}</TableCell>
                    <TableCell>
                      {row.status === "Pending" && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(row)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row.id)}
                          >
                            <Delete />
                          </IconButton>{" "}
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(row.id)}
                          >
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} sx={{ p: 3 }}>
        <DialogTitle>Edit Attendance</DialogTitle>
        <Divider sx={{ ml: 3, mr: 3 }} />
        <DialogContent sx={{ p: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={form.date}
              disabled
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Time In"
              value={form.time_in}
              onChange={(newVal) => setForm((f) => ({ ...f, time_in: newVal }))}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Time Out"
              value={form.time_out}
              onChange={(newVal) =>
                setForm((f) => ({ ...f, time_out: newVal }))
              }
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </DialogContent>
        <Divider sx={{ ml: 3, mr: 3 }} />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained">
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        sx={{ p: 3 }}
      >
        <DialogTitle>Export Attendance</DialogTitle>
        <Divider sx={{ ml: 3, mr: 3 }} />
        <DialogContent sx={{ p: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              sx={{ mt: 2 }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              sx={{ mt: 2, ml: 5 }}
            />
          </LocalizationProvider>
        </DialogContent>
        <Divider sx={{ ml: 3, mr: 3 }} />
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setExportOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleExport} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <Divider sx={{ ml: 3, mr: 3 }} />
        <DialogContent>
          <Typography>
            Are you sure you want to delete this attendance record?
          </Typography>
        </DialogContent>
        <Divider sx={{ ml: 3, mr: 3 }} />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined">
            No
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

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
