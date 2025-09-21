import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import Grid from "@mui/material/Grid";
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

const EmployeeDashboard: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const employeeId = userData?.employeeId || "EMP001";

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [leaveLogs, setLeaveLogs] = useState<LeaveLog[]>([]);
  const [loading, setLoading] = useState(true); // initial page load
  const [overlayLoading, setOverlayLoading] = useState(false); // API calls

  // Fetch Attendance + Leave from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setOverlayLoading(true);

        // Attendance API
        const attendanceRes = await axios.get(
          `${API_ENDPOINTS.attendance(employeeId)}?month=2025-09`
        );

        // Leave API
        const leaveRes = await axios.get(
          API_ENDPOINTS.leaveRequests(employeeId)
        );

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "#a5d6a7"; // green
      case "Pending":
        return "#fff59d"; // yellow
      case "Rejected":
        return "#ef9a9a"; // red
      default:
        return "#e0e0e0";
    }
  };

  if (loading) {
    // Page-level loader for first render
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

  return (
    <>
      <Navigation />
      <Box p={2}>
        <Typography variant="h5" gutterBottom>
          {employeeId} Dashboard
        </Typography>

        <Grid container spacing={2} sx={{ bgcolor: "background.paper" }}>
          {/* Left Info Card */}
          <Grid item width={"25%"} xs={12} md={4} {...({} as any)}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employee Information
                </Typography>
                <List sx={{ textAlign: "center" }}>
                  <ListItem>
                    <ListItemText
                      primary="Name"
                      secondary={userData?.name || "John Doe"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Total Days" secondary="220" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Overtime Hours" secondary="45" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Total Leaves" secondary="12" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Current Project"
                      secondary="SparkPro Fire App"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Manager" secondary="EMP002" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance Logs */}
          <Grid item width={"50%"} xs={12} md={6} {...({} as any)}>
            {attendanceLogs.map((log, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  backgroundColor: getStatusColor(log.status),
                  boxShadow: 2,
                }}
              >
                <CardContent>
                  <Typography variant="body1">Date: {log.date}</Typography>
                  <Typography variant="body2">Time In: {log.timeIn}</Typography>
                  <Typography variant="body2">
                    Time Out: {log.timeOut}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    {log.status}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* Leave Logs */}
          <Grid item width={"25%"} xs={12} md={2} {...({} as any)}>
            {leaveLogs.map((leave, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  backgroundColor: getStatusColor(leave.status),
                  boxShadow: 2,
                }}
              >
                <CardContent>
                  <Typography variant="body1">
                    Leave Date: {leave.leaveDate}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    {leave.status}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
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

export default EmployeeDashboard;
