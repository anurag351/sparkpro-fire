export const API_BASE_URL = "http://127.0.0.1:8000";
export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login`,
  employeeDetails: (employeeId) =>
    `${API_BASE_URL}/employees/employeeID/${employeeId}`,
  attendance: (employeeId) => `${API_BASE_URL}/attendance/${employeeId}`,
  leaveRequests: (employeeId) => `${API_BASE_URL}/leaves/${employeeId}`,
  applyLeave: (employeeId) => `${API_BASE_URL}/leaves/apply/${employeeId}`,
  tasks: (employeeId) => `${API_BASE_URL}/tasks/${employeeId}`,
};
