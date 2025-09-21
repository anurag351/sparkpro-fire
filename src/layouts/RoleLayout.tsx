// src/layouts/RoleLayout.tsx
import { ReactNode } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
} from "@mui/material";

const drawerWidth = 240;

interface RoleLayoutProps {
  role: string;
}

const RoleLayout = ({ role }: RoleLayoutProps) => {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/employees", label: "Employees" },
    { path: "/requests", label: "Requests" },
    { path: "/audit-logs", label: "Audit Logs" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            SparkPro Fire Controls – {role}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map(({ path, label }) => (
            <ListItemButton key={path} component={Link} to={path}>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default RoleLayout;
