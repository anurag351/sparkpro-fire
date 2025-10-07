import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  IconButton,
} from "@mui/material";

import Navigation from "../components/Navigation";
import { API_ENDPOINTS } from "../config";
import { generateTempPassword } from "../utility/PasswordGenerator";
import SearchCardForEmployee from "../components/SearchCardForEmployee";

interface EmployeeInfo {
  id: string;
  name: string;
  role: string;
  manager_id: string;
}
type Role = "Employee" | "Manager" | "APD" | "PD" | "MD";
interface Props {
  currentUserRole?: Role;
}

export default function CreatePassword() {
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  // Dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string>();
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [searchId, setSearchId] = useState("");
  const [showDetails, setShowDetails] = useState(false); // controls the next part of the screen
  const [loading, setLoading] = useState(false);
  // Fetch employee details by ID
  const roleHierarchy: Record<Role | "Manager", Role[]> = {
    Employee: ["Employee"],
    Manager: ["Employee"],
    APD: ["Manager", "Employee"],
    PD: ["APD", "Manager", "Employee"],
    MD: ["PD", "APD", "Manager", "Employee"],
  };
  const currentUserRole = userData.role;
  const availableRolesForCurrentUser = roleHierarchy[
    currentUserRole as Role
  ] ?? ["Employee"];

  const handleSearchEmployee = async () => {
    if (!searchId.trim()) {
      setToast({ open: true, type: "error", msg: "Please enter Employee ID" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.employeeDetails(searchId));
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail || errorData?.message || `Error ${res.status}`;
        throw new Error(message);
      }

      const data = await res.json();
      if (data && data.id) {
        setEmployee(data);
        setShowDetails(true); //show rest of the page
      }

      setToast({
        open: true,
        type: "success",
        msg: "Employee details loaded successfully",
      });
      setLoading(false);
    } catch {
      setToast({
        open: true,
        type: "error",
        msg: "Employee not found or error fetching data",
      });
      setEmployee(null);
      setShowDetails(false);
    }
  };

  const handleApply = () => {
    setConfirmOpen(true);
  };

  const confirmCreate = async () => {
    if (!employee || !employee.id) return;
    const temporaryPassword = generateTempPassword(8);
    const payload = {
      username: employee.id,
      password: temporaryPassword,
      temp_password: true,
    };
    try {
      const res = await fetch(API_ENDPOINTS.createPassword(employee.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail || errorData?.message || `Error ${res.status}`;
        throw new Error(message);
      }
      const data = await res.json();
      setTemporaryPassword(temporaryPassword);
      setToast({
        open: true,
        type: "success",
        msg: "Temporary Password Fetched successfully",
      });
    } catch {
      setToast({
        open: true,
        type: "error",
        msg: "Failed to Fetch Temporary Password",
      });
    } finally {
      setConfirmOpen(false);
    }
  };
  const handleCopy = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      alert("Password copied to clipboard ✅");
    }
  };

  return (
    <>
      <Navigation />
      <SearchCardForEmployee
        title="Create Temporary Password"
        role={userData?.role} // try "Manager", "Employee", etc.
        searchId={searchId}
        setSearchId={(val) => {
          setSearchId(val);
          setShowDetails(false);
        }}
        onSearch={handleSearchEmployee}
        placeholder="Enter Employee ID"
        buttonText="Search"
      />

      {showDetails && (
        <Card
          elevation={8}
          sx={{
            zIndex: 1200,
            m: 4,
            p: 3,
            borderRadius: 2,
            mt: 5,
          }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Employee Details
            </Typography>

            {/* Leave Form */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)", // 4 equal columns
                gap: 4, // space between columns
                mt: 3,
              }}
            >
              <Typography>
                <strong>Name:</strong> {employee?.name}
              </Typography>
              <Typography>
                <strong>Role:</strong> {employee?.role}
              </Typography>
              <Typography>
                <strong>Manager:</strong> {employee?.manager_id}
              </Typography>
            </Box>
            {temporaryPassword ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)", // 4 equal columns
                  gap: 4, // space between columns
                  mt: 3,
                }}
              >
                <Typography color="text.secondary">
                  Please share the password with respective Employee
                </Typography>
                <Typography variant="h6" sx={{ wordBreak: "break-all" }}>
                  {temporaryPassword}
                  <IconButton onClick={handleCopy} color="primary">
                    <ContentCopyIcon />
                  </IconButton>
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  gap: 2,
                  mt: 5,
                }}
              >
                <Typography sx={{ mt: 5 }} color="text.secondary">
                  Click Create Temporary Password to get a password
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleApply}
                  sx={{ borderRadius: 3, mt: 3 }}
                >
                  Create Temporary Password
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Typography>
            Are you sure you want to create temporary Password for{" "}
            {employee?.name} {employee?.id}
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined">
            No
          </Button>
          <Button onClick={confirmCreate} color="error" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={!!toast?.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => (t ? { ...t, open: false } : null))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert
            severity={toast.type}
            onClose={() => setToast(null)}
            sx={{ width: "100%" }}
          >
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
