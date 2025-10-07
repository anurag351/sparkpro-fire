//export const API_BASE_URL = "http://127.0.0.1:8000";
export const API_BASE_URL = "https://sparkpro-fire.onrender.com";
export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login`,
  createPassword: (employeeId) =>
    `${API_BASE_URL}/users/createPassword/${employeeId}`,
  addEmployee: (employeeId) =>
    `${API_BASE_URL}/employees/createdBy/${employeeId}`,
  employeeDetails: (employeeId) =>
    `${API_BASE_URL}/employees/employeeID/${employeeId}`,
  updateEmployeePhoto: (employee_id) =>
    `${API_BASE_URL}/employees/${employee_id}/upload-photo`,
  showPhoto: (path) => `${API_BASE_URL}/static/passports/${path}`,
  employeeDetailsByRole: (role) => `${API_BASE_URL}/employees/${role}`,
  tasks: (employeeId) => `${API_BASE_URL}/tasks/${employeeId}`,
  addAttendance: (employeeId) =>
    `${API_BASE_URL}/attendance/createdby/${employeeId}`,
  viewAttendanceByID: (employeeId) =>
    `${API_BASE_URL}/attendance/getAttendanceByID/${employeeId}`,
  viewattendanceByApproverStatus: (approverId, status) =>
    `${API_BASE_URL}/attendance/approver/${approverId}/status/${status}`,
  viewattendanceByEmployeeStatus: (employeeId, status) =>
    `${API_BASE_URL}/attendance/employee/${employeeId}/status/${status}`,
  viewAttendanceByMonth: (employeeId, year, month) =>
    `${API_BASE_URL}/attendance/employee/${employeeId}/month/${year}/to/${month}`,
  updateAttendanceStatus: (attendanceId) =>
    `${API_BASE_URL}/attendance/${attendanceId}/status`,
  editAttendance: (employee_id, attendance_date) =>
    `${API_BASE_URL}/attendance/updateAttendance/updatedBy/${employee_id}/date/${attendance_date}`,
  deleteAttendanceByID: (employeeId, attendance_date) =>
    `${API_BASE_URL}/attendance/deleteAttendance/employee/${employeeId}/date/${attendance_date}`,
  exportAttendance: (start_date, end_date) =>
    `${API_BASE_URL}/attendance/export?start_date=${start_date}&end_date=${end_date}`,
  approveAttendance: (attendance_id, user) =>
    `${API_BASE_URL}/attendance/${attendance_id}/approve/${user}`,
  rejectAttendance: (attendance_id, user) =>
    `${API_BASE_URL}/attendance/${attendance_id}/reject/${user}`,

  updateLeave: (id) => `${API_BASE_URL}/leaves/updateLeaveByID/${id}`,
  leaveRequests: (employeeId) =>
    `${API_BASE_URL}/leaves/getLeaveBy-employeeID/${employeeId}`,
  applyLeave: (employeeId) => `${API_BASE_URL}/leaves/applyLeave/${employeeId}`,
  deleteLeave: (id) => `${API_BASE_URL}/leaves/deleteLeavebyID/${id}`,
  updateLeaveStatus: (leaveId, createdBy) =>
    `${API_BASE_URL}/leaves/updateStatus/${leaveId}/by/${createdBy}`,
  exportLeave: (start_date, end_date) =>
    `${API_BASE_URL}/leaves/export?start_date=${start_date}&end_date=${end_date}`,
};
