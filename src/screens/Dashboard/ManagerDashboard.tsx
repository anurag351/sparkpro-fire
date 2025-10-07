import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Grid,
} from "@mui/material";
import Navigation from "../../components/Navigation";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";

interface AttendanceLog {
  timeIn: string;
  timeOut: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
}

interface LeaveLog {
  leaveDate: string;
  status: "Approved" | "Pending" | "Rejected";
}

const ManagerDashboard: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const employeeId = userData?.id || "EMP001";

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [leaveLogs, setLeaveLogs] = useState<LeaveLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [overlayLoading, setOverlayLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setOverlayLoading(true);

        const [attendanceRes, leaveRes] = await Promise.all([
          axios.get(API_ENDPOINTS.viewAttendanceByID(employeeId)),
          axios.get(API_ENDPOINTS.leaveRequests(employeeId)),
        ]);

        setAttendanceLogs(attendanceRes.data || []);
        setLeaveLogs(leaveRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setOverlayLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={70} />
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "#a5d6a7";
      case "Pending":
        return "#fff59d";
      case "Rejected":
        return "#ef9a9a";
      default:
        return "#e0e0e0";
    }
  };

  // Filter pending only
  const pendingAttendance = attendanceLogs.filter(
    (a) => a.status === "Pending"
  );
  const pendingLeaves = leaveLogs.filter((l) => l.status === "Pending");

  return (
    <>
      <Navigation />
      <Box p={3} sx={{ maxWidth: "1200px", margin: "auto" }}>
        {/* --- EMPLOYEE INFO CARD --- */}
        <Card sx={{ boxShadow: 3, mb: 3, p: 3 }}>
          <Box>
            {/* Employee Photo */}
            <Grid item xs={12} md={3} textAlign="center" {...({} as any)}>
              <Avatar
                alt={userData?.name || "Employee"}
                src={userData?.photoUrl || "/default-avatar.png"}
                sx={{ width: 140, height: 140, margin: "auto" }}
              />
              <Box item xs={12} md={4} sx={{ mt: 3 }} {...({} as any)}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {userData?.name || "John Doe"}
                </Typography>
              </Box>
            </Grid>

            {/* Employee Details */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)", // 4 equal columns
                gap: 4, // space between columns
                mt: 3,
              }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                <strong>Employee ID:</strong> {employeeId}
              </Typography>

              <Typography variant="subtitle1" color="text.secondary">
                <strong>Role:</strong> {userData?.role || "Employee"}
              </Typography>

              <Typography variant="subtitle1" color="text.secondary">
                <strong>Contact:</strong> {userData?.contact || "N/A"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)", // 4 equal columns
                gap: 4, // space between columns
                mt: 3,
              }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                <strong>Manager:</strong> {userData?.managerId || "EMP002"}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                <strong>Project:</strong>{" "}
                {userData?.project || "SparkPro Fire App"}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                <strong>Status:</strong>{" "}
                {userData?.isActive ? "Active" : "Inactive"}
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* --- PENDING ATTENDANCE TABLE --- */}
        <Card sx={{ boxShadow: 3, mb: 3, p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Pending Attendance
          </Typography>
          {pendingAttendance.length > 0 ? (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Time In</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Time Out</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingAttendance.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.timeIn}</TableCell>
                      <TableCell>{log.timeOut}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: getStatusColor(log.status),
                            borderRadius: "8px",
                            textAlign: "center",
                            p: 0.5,
                            fontWeight: "bold",
                          }}
                        >
                          {log.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" mb={3}>
              No pending attendance requests.
            </Typography>
          )}
        </Card>

        {/* --- PENDING LEAVE REQUESTS TABLE --- */}
        <Card sx={{ boxShadow: 3, mb: 3, p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Pending Leave Requests
          </Typography>
          {pendingLeaves.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Leave Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingLeaves.map((leave, index) => (
                    <TableRow key={index}>
                      <TableCell>{leave.leaveDate}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: getStatusColor(leave.status),
                            borderRadius: "8px",
                            textAlign: "center",
                            p: 0.5,
                            fontWeight: "bold",
                          }}
                        >
                          {leave.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">
              No pending leave requests.
            </Typography>
          )}
        </Card>
      </Box>

      {/* Overlay Loader */}
      <Backdrop
        open={overlayLoading}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default ManagerDashboard;
