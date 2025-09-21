import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./screens/Landing";
import Login from "./screens/Login";
import EmployeeDashboard from "./screens/Dashboard/EmployeeDashboard";
import ManagerDashboard from "./screens/Dashboard/ManagerDashboard";
import AdminDashboard from "./screens/Dashboard/AdminDashboard";
import ClientDashboard from "./screens/Dashboard/ClientDashboard";
import ResetPassword from "./screens/ResetPassword";
import EmployeeOnboard from "./screens/EmployeeOnboarding";
import AttendanceUpdate from "./screens/AttendanceUpdate";
import LeaveModule from "./screens/LeaveModule";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboardemployee" element={<EmployeeDashboard />} />
        <Route path="/dashboardmanager" element={<ManagerDashboard />} />
        <Route path="/dashboardadmin" element={<AdminDashboard />} />
        <Route path="/dashboardclient" element={<ClientDashboard />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/employeeOnboard" element={<EmployeeOnboard />} />
        <Route path="/attendance" element={<AttendanceUpdate />} />
        <Route path="/leaveRequest" element={<LeaveModule />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
