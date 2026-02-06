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
import Navigation from "../../components/Navigation";
import { API_ENDPOINTS } from "../../config";
import ExportDialog from "../../components/ExportDialogProps";
import ConfirmDialog from "../../components/ConfirmDialogDynamic";
import { GridDeleteForeverIcon } from "@mui/x-data-grid";

interface EmployeeInfo {
  id: string;
  name: string;
  role: string;
  manager_id: string;
}

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
  const DGDeleteIcon = GridDeleteForeverIcon as unknown as React.ElementType;
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [employee, setEmployee] = useState<EmployeeInfo>(userData);
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    setEmployee(userData);
    fetchLeave();
  }, []);

  const fetchLeave = async () => {
    if (!employee) return setLeaves([]);
    const res = await fetch(API_ENDPOINTS.leaveRequests(employee?.id));
    const data = res.ok ? await res.json() : [];
    setLeaves(data);
  };

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
      reason: form.reason,
      employee_id: employee.id,
      approver_l1: employee.manager_id,
    };

    try {
      const url = editId
        ? API_ENDPOINTS.updateLeave(editId)
        : API_ENDPOINTS.applyLeave(userData.id);

      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || errorData?.message || `Error ${res.status}`
        );
      }

      setToast({
        open: true,
        type: "success",
        msg: editId
          ? "Leave updated successfully"
          : "Leave applied successfully",
      });
    } catch (err) {
      setToast({
        open: true,
        type: "error",
        msg:
          err instanceof Error ? err.message : "Failed to apply/update leave",
      });
    } finally {
      clearAll();
      setEditOpen(false);
      fetchLeave();
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.deleteLeave(deleteId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();

      setToast({
        open: true,
        type: "success",
        msg: "Leave deleted successfully",
      });
    } catch {
      setToast({
        open: true,
        type: "error",
        msg: "Delete failed",
      });
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
      fetchLeave();
      setLoading(false);
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
        if (row.status !== "Approved" && row.status !== "Pending") {
          return (
            <Box>
              <IconButton
                color="primary"
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
              <IconButton
                color="error"
                onClick={() => handleDeleteClick(row.id)}
              >
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

      {/* ======================== MAIN CARD ======================== */}
      <Card
        elevation={8}
        sx={{ zIndex: 1200, m: 4, p: 3, borderRadius: 2, mt: 5 }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Apply for Leave
          </Typography>

          {/* ======================== EMPLOYEE INFO ======================== */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1.5, sm: 4 },
              mt: 3,
              width: "100%",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "1rem" }}>
                <strong>Name:</strong> {employee.name}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "1rem" }}>
                <strong>Role:</strong> {employee.role}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "1rem" }}>
                <strong>Manager:</strong> {employee.manager_id}
              </Typography>
            </Box>
          </Box>

          {/* ======================== FORM FIELDS ======================== */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
              mt: 5,
            }}
          >
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

          {/* ======================== BUTTONS ======================== */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mt: 5,
            }}
          >
            <Button
              variant="outlined"
              onClick={clearAll}
              sx={{ height: 45, borderRadius: 3, pl: 5, pr: 5 }}
            >
              Clear All
            </Button>

            <Button
              variant="contained"
              onClick={handleApply}
              sx={{ height: 45, borderRadius: 3, pl: 5, pr: 5 }}
            >
              {editId ? "Update" : "Apply"}
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => setExportOpen(true)}
              sx={{ height: 45, borderRadius: 3, pl: 5, pr: 5 }}
            >
              Export
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ======================== TABLE SECTION ======================== */}
      <Card elevation={8} sx={{ zIndex: 1200, m: 4, p: 3, borderRadius: 2 }}>
        <CardContent>
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              mt: 3,
            }}
          >
            <Box sx={{ minWidth: "650px", height: 400 }}>
              <DataGrid
                rows={leaves}
                columns={columns}
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 20]}
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f5f5f5",
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-cell": {
                    fontSize: "14px",
                  },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ======================== EDIT DIALOG ======================== */}
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

      {/* ======================== EXPORT DIALOG ======================== */}
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={async ({ startDate, endDate, status }) => {
          try {
            if (!startDate || !endDate) {
              setToast({
                open: true,
                type: "error",
                msg: "Please select start and end date",
              });
              return;
            }

            const res = await fetch(
              `${API_ENDPOINTS.exportLeave(startDate, endDate)}&employee_id=${
                employee.id
              }&status=${status}`
            );

            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.detail || "Export failed");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "leave.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();

            setToast({
              open: true,
              type: "success",
              msg: "Export successful",
            });
            setExportOpen(false);
          } catch (err) {
            setToast({
              open: true,
              type: "error",
              msg: err instanceof Error ? err.message : "Export failed",
            });
          }
        }}
      />

      {/* ======================== DELETE CONFIRM ======================== */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this leave request?"
        confirmColor="error"
        icon={<DGDeleteIcon color="error" fontSize="medium" />}
        transition="slide"
        loading={loading}
      />

      {/* ======================== TOAST ======================== */}
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
