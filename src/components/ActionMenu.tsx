// src/components/ActionMenu.tsx
import React, { useState, useEffect } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";

const actionButtonValues = [
  { label: "Add/Update Attendance", route: "/attendanceupdate" },
  { label: "Add/Update Leave", route: "/leaveupdate" },
  { label: "Show Employee", route: "/showemployee" },
  { label: "Onboarding Employee", route: "/onboardingemployee" },
  { label: "Create Temporary Password", route: "/createpassword" },
  { label: "Update Employee Details", route: "/inprogress" },
  {
    label: "Calculate or Generate Salary",
    route: "/calculateorgeneratesalary",
  },
  {
    label: "Withdraw Advanced Salary",
    route: "/withdrawadvancedsalary",
  },
  { label: "Assign Project", route: "/inprogress" },
  { label: "Add Project", route: "/inprogress" },
  { label: "Update Progress Project", route: "/inprogress" },
  { label: "Audit Log", route: "/inprogress" },
];

const ActionMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = userData?.role || "Employee";
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const allowedSalaryRoles = ["MD", "PD"];
  const allowedAuditRoles = ["MD", "PD"];
  const allowedAllEmployeeData = ["MD", "PD"];

  const filteredActions = actionButtonValues.filter((item) => {
    if (item.label === "Calculate or Generate Salary") {
      return allowedSalaryRoles.includes(role);
    }
    if (item.label === "Audit Log") {
      return allowedAuditRoles.includes(role);
    }
    if (item.label === "Withdraw Advanced Salary") {
      return allowedSalaryRoles.includes(role);
    }
    if (
      item.label === "Show Employee" ||
      item.label === "Update Employee Details"
    ) {
      return allowedAllEmployeeData.includes(role);
    }
    return true;
  });
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  useEffect(() => {
    if (role === "Employee" || role === "Manager") {
    }
    if (role && role !== "Employee") {
    }
  }, [role]);
  const handleClose = (route?: string) => {
    setAnchorEl(null);
    if (route) navigate(route);
  };

  return (
    <>
      <Button
        color="inherit"
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
        sx={{
          fontWeight: 600,
          textTransform: "none",
          fontSize: 16,
          mr: 3,
        }}
      >
        Action
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 2,
            bgcolor: "peachpuff",
          },
        }}
      >
        {filteredActions.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleClose(item.route)}
            sx={{
              fontWeight: 500,
              "&:hover": { bgcolor: "primary.light", color: "white" },
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ActionMenu;
