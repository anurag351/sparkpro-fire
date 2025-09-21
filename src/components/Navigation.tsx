import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const employeeName = userData?.name || "Employee";
  const employeeId = userData?.employeeId || "EMP001";

  return (
    <AppBar position="static" sx={{ backgroundColor: "#37474f" }}>
      <Toolbar>
        {/* Left side Employee Name */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          SparkPro Fire Controls Pvt. Ltd.
        </Typography>

        {/* Buttons */}
        <Button
          color="inherit"
          startIcon={<DashboardIcon />}
          onClick={() => navigate("/dashboardemployee")}
          sx={{ mr: 3, mt: 1 }}
        >
          Dashboard
        </Button>
        <Button
          color="inherit"
          startIcon={<EventNoteIcon />}
          onClick={() => navigate("/attendance")}
          sx={{ mr: 3, mt: 1 }}
        >
          Attendance
        </Button>
        <Button
          color="inherit"
          startIcon={<AssignmentTurnedInIcon />}
          onClick={() => navigate("/leaveRequest")}
          sx={{ mr: 3, mt: 1 }}
        >
          Leave Request
        </Button>

        {/* Logout */}
        <IconButton
          color="inherit"
          onClick={() => navigate("/login")}
          sx={{ mt: 1 }}
        >
          <ExitToAppIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
