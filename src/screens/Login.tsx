// src/screens/Login.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import { API_ENDPOINTS } from "../config";
import ResponsiveAppBar from "../components/NavigationHome";

const Login: React.FC = () => {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();

  // 🔹 EmployeeID validation
  const validateusername = (value: string): string | undefined => {
    const regex = /^[A-Za-z]{2}\d{6}$/;
    if (!regex.test(value)) {
      return "Please Enter Correct Employee ID (e.g. AB1234)";
    }
    return undefined;
  };

  // 🔹 Password validation
  const validatePassword = (value: string): string | undefined => {
    if (value.length < 6) return "Please Enter Correct Password (min 6 chars)";
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
      return "Password must contain both alphabets and digits";
    }
    return undefined;
  };

  // 🔹 On change validate
  const handleusernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setusername(value);
    setErrors((prev) => ({ ...prev, username: validateusername(value) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleLogin = async () => {
    const empErr = validateusername(username);
    const passErr = validatePassword(password);

    if (empErr || passErr) {
      setErrors({ username: empErr, password: passErr });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      console.log("Login Success:", data);
      if (data) {
        const userData = await fetch(API_ENDPOINTS.employeeDetails(username), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        // Save token in localStorage
        const dataNew = await userData.json();
        if (dataNew) {
          localStorage.setItem("userData", JSON.stringify(dataNew));
          // Navigate to dashboard based on role
          switch (dataNew.role.toUpperCase()) {
            case "EMPLOYEE":
              navigate(`/dashboardemployee`);
              break;
            case "MANAGER":
              navigate(`/dashboardmanager`);
              break;
            case "APD":
            case "PD":
            case "MD":
              navigate(`/dashboardadmin`);
              break;
            default:
              navigate(`/dashboardclient`);
          }
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Login failed. Please check credentials.");
      setError("Login failed. Please check credentials.");
      alert(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false); // stop loader
    }
  };

  const requestPasswordAPI = async (empId: string) => {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 1500)
    );
    // Later replace with:
    /*
    const res = await fetch("http://127.0.0.1:8000/auth/request-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: empId }),
    });
    return res.json();
    */
  };

  return (
    <>
      <ResponsiveAppBar />
      <Box
        sx={{
          height: "100vh",
          bgcolor: "#f0f0f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Card
          sx={{
            maxWidth: 400,
            width: "100%",
            bgcolor: "background.paper",
            boxShadow: 6,
            zIndex: 10,
            padding: 3,
          }}
        >
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Login
            </Typography>

            <Stack spacing={2}>
              {/* Employee ID */}
              <TextField
                label="Employee ID"
                fullWidth
                value={username}
                onChange={handleusernameChange}
                error={!!errors.username}
                helperText={errors.username}
              />

              {/* Password */}
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={handlePasswordChange}
                error={!!errors.password}
                helperText={errors.password}
              />

              {/* Login button */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleLogin}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Login"
                )}
              </Button>

              {/* Request new password */}
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => setDialogOpen(true)}
                disabled={loading}
              >
                Request New Password
              </Button>

              {/* Reset Password */}
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => navigate("/resetPassword")}
                disabled={loading}
              >
                Reset Password
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={dialogOpen}
          title="Password Request"
          message={`Agar aap password bhul gaye hai to Request Password kijiye aur Apne Manager se Temporary password prapt kijiye aur uske baad Reset Password karke naya password set kijiye.\nAfter creating new password aap portal par dubara login kijiye.`}
          onConfirm={async () => {
            setDialogLoading(true);
            try {
              const result: any = await requestPasswordAPI(username);
              if (result.success) {
                alert("Password request submitted!");
              }
            } catch (err) {
              alert("Failed to submit request!");
            } finally {
              setDialogLoading(false);
              setDialogOpen(false);
            }
          }}
          onCancel={() => setDialogOpen(false)}
          loading={dialogLoading} // pass loading state
        />
      </Box>
    </>
  );
};

export default Login;
