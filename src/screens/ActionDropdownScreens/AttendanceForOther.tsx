import React, { useState, useEffect, Suspense, lazy } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel"; // Reject icon (red cross)
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
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Edit, Delete, GetApp } from "@mui/icons-material";
import Navigation from "../../components/Navigation";
import { API_ENDPOINTS } from "../../config";
import AppLoader from "../../utility/AppLoader";
import ExportDialog from "../../components/ExportDialogProps";
import SearchCardForEmployee from "../../components/SearchCardForEmployee";
import { Employee } from "../../utility/Employee";
const EditAttendanceDialog = lazy(
  () => import("../../components/EditAttendanceDialog")
);
const RejectDialog = lazy(() => import("../../components/RejectDialog"));

interface AttendanceForm {
  id?: string;
  employee_id?: string;
  date: Dayjs | null;
  time_in: Dayjs | null;
  time_out: Dayjs | null;
}

interface AttendanceRow {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  status: "Approved" | "Pending" | "Rejected";
  review_comment: string;
  hours_worked: string;
  overtime_hours: string;
  approved_by: string;
}

export default function AttendanceForOther() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const [employee, setEmployee] = useState<Employee | null>(null);
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
  const [searchId, setSearchId] = useState("");
  const [showDetails, setShowDetails] = useState(false); // controls the next part of the screen
  const [loading, setLoading] = useState(false);
  // Fetch employee details by ID
  useEffect(() => {
    if (employee) {
      fetchAttendance(employee);
    }
  }, [employee]);

  const fetchAttendance = async (employee: any) => {
    // TODO: replace with your real API
    if (!employee) {
      setAttendanceData([]);
    } else {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.viewAttendanceByID(employee?.id));
      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data);
      } else {
        setAttendanceData([]);
      }
      setLoading(false);
    }
  };

  const clearAll = () => {
    setForm({ date: dayjs(), time_in: null, time_out: null });
  };

  // CREATE NEW ATTENDANCE
  const handleSubmit = async () => {
    if (!employee || !form.date || !form.time_in || !form.time_out) {
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
        approved_by: employee.manager_id,
      };

      const res = await fetch(API_ENDPOINTS.addAttendance(userData.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail || errorData?.message || `Error ${res.status}`;
        throw new Error(message);
      }

      setToast({
        open: true,
        type: "success",
        msg: "Attendance Created Successfully",
      });
      clearAll();
      fetchAttendance(employee);
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
      employee_id: row.employee_id,
      id: row.id,
      date: dayjs(row.date),
      time_in: dayjs(row.time_in, "HH:mm:ss"),
      time_out: dayjs(row.time_out, "HH:mm:ss"),
    });
    setEditOpen(true);
  };

  // SAVE EDIT
  const handleEditSave = async () => {
    if (!employee || !form.id || !form.date || !form.time_in || !form.time_out)
      return;

    try {
      const payload = {
        employee_id: form.employee_id,
        date: form.date.format("YYYY-MM-DD"),
        time_in: form.time_in.format("HH:mm:ss"),
        time_out: form.time_out.format("HH:mm:ss"),
      };

      const res = await fetch(
        API_ENDPOINTS.editAttendance(userData.id, payload.date),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail || errorData?.message || `Error ${res.status}`;
        throw new Error(message);
      }

      setToast({
        open: true,
        type: "success",
        msg: "Attendance Updated Successfully",
      });
      setEditOpen(false);
      clearAll();
      fetchAttendance(employee);
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
  const [deleteData, setDeleteData] = useState<AttendanceRow | null>(null);

  // --- Modify handleDelete ---
  const handleDeleteClick = (row: any) => {
    setDeleteData(row);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteData) return;
    try {
      const res = await fetch(
        API_ENDPOINTS.deleteAttendanceByID(
          deleteData.employee_id,
          deleteData.date
        ),
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail || errorData?.message || `Error ${res.status}`;
        throw new Error(message);
      }

      setToast({ open: true, type: "success", msg: "Deleted Successfully" });
      fetchAttendance(employee);
    } catch {
      setToast({ open: true, type: "error", msg: "Delete Failed" });
    } finally {
      setDeleteOpen(false);
      setDeleteData(null);
    }
  };
  const handleApprove = async (attendanceId: string) => {
    try {
      // Example API call
      const res = await fetch(
        API_ENDPOINTS.approveAttendance(attendanceId, userData.id),
        {
          method: "POST",
        }
      );

      if (res.ok) {
        // Update UI (refresh attendance or set toast)
        setToast({
          open: true,
          type: "success",
          msg: "Attendance approved successfully!",
        });

        // Refresh data
        fetchAttendance(employee);
      } else {
        setToast({
          open: true,
          type: "error",
          msg: "Failed to approve attendance",
        });
      }
    } catch (error) {
      console.error("Error approving attendance:", error);
      setToast({
        open: true,
        type: "error",
        msg: "Something went wrong!",
      });
    }
  };

  // EXPORT
  const [openReject, setOpenReject] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<
    string | null
  >(null);
  const [comment, setComment] = useState("");

  const handleOpenReject = (id: string) => {
    setSelectedAttendanceId(id);
    setOpenReject(true);
  };

  const handleReject = async (attendanceId: string, reviewComment: string) => {
    try {
      const res = await fetch(
        API_ENDPOINTS.rejectAttendance(attendanceId, userData.id),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review_comment: reviewComment }), // send comment to backend
        }
      );

      if (res.ok) {
        setToast({
          open: true,
          type: "success",
          msg: "Attendance rejected successfully",
        });
        fetchAttendance(employee); // refresh table
      } else {
        setToast({
          open: true,
          type: "error",
          msg: "Failed to reject attendance",
        });
      }
    } catch (error) {
      console.error("Error rejecting attendance:", error);
      setToast({
        open: true,
        type: "error",
        msg: "Something went wrong!",
      });
    }
  };

  return (
    <>
      <Navigation />
      <SearchCardForEmployee
        title="Update Employee Attendance"
        role={userData?.role} // try "Manager", "Employee", etc.
        searchId={searchId}
        setSearchId={(val) => {
          setSearchId(val);
          setShowDetails(false);
        }}
        setEmployee={setEmployee}
        setShowDetails={setShowDetails}
        placeholder="Enter Employee ID"
        buttonText="Search"
      />
      {/* Top Card */}
      {showDetails && (
        <Card
          elevation={8}
          sx={{
            zIndex: 1200,
            m: 4,
            p: 3,
            borderRadius: 2,
            mt: 5,
          }}
        >
          <CardContent>
            {/* Static Employee Info */}
            {loading ? (
              <AppLoader type="spinner" rows={6} cols={4} />
            ) : (
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
                    <strong>Name:</strong> {employee?.name}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "1rem" }}>
                    <strong>Role:</strong> {employee?.role}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "1rem" }}>
                    <strong>Manager:</strong> {employee?.manager_id}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Attendance Fields */}
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
                  label="Date"
                  value={form.date}
                  onChange={(newVal) =>
                    setForm((f) => ({ ...f, date: newVal }))
                  }
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
                onClick={handleSubmit}
                sx={{ height: 45, borderRadius: 3, pl: 5, pr: 5 }}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<GetApp />}
                onClick={() => setExportOpen(true)}
                sx={{ height: 45, borderRadius: 3, pl: 5, pr: 5 }}
              >
                Export
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {showDetails && (
        <Card
          elevation={9}
          sx={{
            zIndex: 1200,
            m: 4,
            p: 3,
            borderRadius: 2,
            mt: 5,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Pending Attendance of {employee?.name}
            </Typography>
            {loading ? (
              <AppLoader type="skeleton" rows={6} cols={4} />
            ) : attendanceData?.length > 0 ? (
              <TableContainer sx={{ border: 1, borderColor: "gray" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Time In</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Time Out
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Hour Worked
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Over Time
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Review Comment
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.time_in}</TableCell>
                        <TableCell>{row.time_out}</TableCell>
                        <TableCell>{row.hours_worked}</TableCell>
                        <TableCell>{row.overtime_hours}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.review_comment}</TableCell>
                        <TableCell>
                          {row.status === "Pending" && (
                            <>
                              <Tooltip title="Edit Attendance">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEdit(row)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Approve Attendance">
                                <IconButton
                                  color="success"
                                  onClick={() => handleApprove(row.id)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Reject Attendance">
                                <IconButton
                                  color="error"
                                  onClick={() => handleOpenReject(row.id)}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No attendance found for this employee
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Suspense fallback={<CircularProgress sx={{ mt: 3 }} />}>
        {editOpen && (
          <EditAttendanceDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            form={form}
            setForm={setForm}
            onSave={handleEditSave}
          />
        )}
      </Suspense>

      {/* Export Dialog */}
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

            if (employee) {
              const query = new URLSearchParams({
                employee_id: employee.id,
                start: startDate,
                end: endDate,
                status,
              });

              const res = await fetch(
                `${API_ENDPOINTS.exportAttendance(
                  startDate,
                  endDate
                )}&employee_id=${employee.id}&status=${status}`
              );

              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Export failed");
              }

              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "attendance.xlsx";
              document.body.appendChild(link);
              link.click();
              link.remove();

              setToast({
                open: true,
                type: "success",
                msg: "Export successful",
              });
            } else {
              setToast({
                open: true,
                type: "error",
                msg: "Export failed ",
              });
            }
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

      <Suspense fallback={<CircularProgress sx={{ mt: 3 }} />}>
        {openReject && (
          <RejectDialog
            open={openReject}
            title="Reject Attendance"
            review_comment={comment}
            setComment={setComment}
            onClose={() => setOpenReject(false)}
            onConfirm={async () => {
              if (selectedAttendanceId) {
                await handleReject(selectedAttendanceId, comment);
                setOpenReject(false);
              }
            }}
          />
        )}
      </Suspense>

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
