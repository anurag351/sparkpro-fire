import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ResponsiveAppBar from "../components/NavigationHome";
import { generateTempPassword } from "../utility/PasswordGenerator";
import { API_ENDPOINTS } from "../config";

const ResetPassword: React.FC = () => {
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const empRegex = /^[A-Za-z]{2}\d{4,}$/;
    if (!empRegex.test(employeeId)) {
      setError("Please Enter Correct Employee ID");
      return false;
    }

    if (
      oldPassword.length < 6 ||
      !/[A-Za-z]/.test(oldPassword) ||
      !/\d/.test(oldPassword)
    ) {
      setError("Please Enter Correct Old Password");
      return false;
    }

    if (
      newPassword.length < 6 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setError(
        "New Password must be at least 6 characters, include letters and digits",
      );
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Confirm Password does not match New Password");
      return false;
    }

    setError("");
    return true;
  };

  const handleContinue = async () => {
    if (validateForm()) {
      const payload = {
        username: employeeId,
        password: newPassword,
        temp_password: false,
      };
      try {
        const res = await fetch(API_ENDPOINTS.createPassword(employeeId), {
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

        setTimeout(() => {
          setToast({
            open: true,
            type: "success",
            msg: "Password Reset successfully",
          });
        }, 5000);
        navigate(`/login`);
        const data = await res.json();
      } catch (err: any) {
        setToast({
          open: true,
          type: "error",
          msg: "Failed to Reset Password",
        });
      }
    }
  };

  const handleBack = () => {
    navigate("/login"); // 🔙 route back to login page
  };

  return (
    <>
      <ResponsiveAppBar />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
      >
        <Card
          sx={{
            width: 400,
            p: 2,
            boxShadow: 6,
            zIndex: 5,
            backgroundColor: "background.paper", // light pink solid
          }}
        >
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Reset Password
            </Typography>

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Old Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleContinue}
            >
              Continue
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ mt: 3 }}
              onClick={handleBack}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default ResetPassword;
