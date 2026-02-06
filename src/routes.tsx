import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./screens/Landing";
import Login from "./screens/Login";
import EmployeeDashboard from "./screens/Dashboard/EmployeeDashboard";
import ManagerDashboard from "./screens/Dashboard/ManagerDashboard";
import AdminDashboard from "./screens/Dashboard/AdminDashboard";
import ClientDashboard from "./screens/Dashboard/ClientDashboard";
import ResetPassword from "./screens/ResetPassword";
import EmployeeOnboard from "./screens/ActionDropdownScreens/EmployeeOnboarding";
import AttendanceForOther from "./screens/ActionDropdownScreens/AttendanceForOther";
import LeaveModuleForOther from "./screens/ActionDropdownScreens/LeaveModuleForOther";
import AttendanceUpdate from "./screens/DashboardOtherActions/AttendanceUpdate";
import CreatePassword from "./screens/ActionDropdownScreens/CreateTempPassword";
import LeaveModule from "./screens/DashboardOtherActions/LeaveModule";
import SalaryCalculatorCard from "./screens/ActionDropdownScreens/SalaryCalculatorCard";
import WithdrawAdvancedSalary from "./screens/ActionDropdownScreens/WithdrawAdvanceSalary";
import ShowEmployee from "./screens/ActionDropdownScreens/ShowEmployee";
import EmployeeDetails from "./screens/EmployeeDetails";
import WorkInProgress from "./utility/WorkInProgress";

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
        <Route path="/attendanceupdate" element={<AttendanceForOther />} />
        <Route path="/leaveupdate" element={<LeaveModuleForOther />} />
        <Route path="/onboardingemployee" element={<EmployeeOnboard />} />
        <Route path="/createpassword" element={<CreatePassword />} />
        <Route path="/showemployee" element={<ShowEmployee />} />

        <Route
          path="/withdrawadvancedsalary"
          element={<WithdrawAdvancedSalary />}
        />
        <Route
          path="/calculateorgeneratesalary"
          element={<SalaryCalculatorCard />}
        />
        <Route path="/employee-details" element={<EmployeeDetails />} />
        <Route path="/inprogress" element={<WorkInProgress />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
