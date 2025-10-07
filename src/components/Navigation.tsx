import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ActionMenu from "./ActionMenu";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showAttendance, setShowAttendance] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showAction, setShowAction] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const employeeName = userData?.name || "employeeName";
  const employeeId = userData?.id || "employeeId";
  const role = userData?.role || "Employee";

  useEffect(() => {
    if (role === "Employee" || role === "Manager") {
      setShowLeave(true);
      setShowAttendance(true);
    }
    if (role && role !== "Employee") {
      setShowAction(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      show: true,
      action: () => navigate("/dashboardemployee"),
    },
    {
      label: "Attendance",
      icon: <EventNoteIcon />,
      show: showAttendance,
      action: () => navigate("/attendance"),
    },
    {
      label: "Leave Request",
      icon: <AssignmentTurnedInIcon />,
      show: showLeave,
      action: () => navigate("/leaveRequest"),
    },
    {
      label: "Logout",
      icon: <ExitToAppIcon />,
      show: true,
      action: handleLogout,
    },
  ];

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "primary.main", boxShadow: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Company Name */}
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{ fontWeight: "bold" }}
          >
            SparkPro Fire Controls Pvt. Ltd. ({userData.id})
          </Typography>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => navigate("/dashboardemployee")}
                sx={{ mr: 2 }}
              >
                Dashboard
              </Button>
              {showAction && <ActionMenu />}
              {showAttendance && (
                <Button
                  color="inherit"
                  startIcon={<EventNoteIcon />}
                  onClick={() => navigate("/attendance")}
                  sx={{ mr: 2 }}
                >
                  Attendance
                </Button>
              )}
              {showLeave && (
                <Button
                  color="inherit"
                  startIcon={<AssignmentTurnedInIcon />}
                  onClick={() => navigate("/leaveRequest")}
                  sx={{ mr: 2 }}
                >
                  Leave Request
                </Button>
              )}
              <IconButton color="inherit" onClick={handleLogout}>
                <ExitToAppIcon />
              </IconButton>
            </Box>
          )}

          {/* Mobile Hamburger */}
          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        transitionDuration={400}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems
              .filter((item) => item.show)
              .map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      item.action();
                      setDrawerOpen(false);
                    }}
                  >
                    {item.icon}
                    <ListItemText primary={item.label} sx={{ ml: 1 }} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
          {showAction && (
            <Box sx={{ p: 2 }}>
              <ActionMenu />
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;
