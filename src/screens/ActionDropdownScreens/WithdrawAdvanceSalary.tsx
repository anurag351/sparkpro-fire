import React, { useState } from "react";
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
  MenuItem,
} from "@mui/material";

import SearchCardForEmployee from "../../components/SearchCardForEmployee";
import { API_ENDPOINTS } from "../../config";
import Navigation from "../../components/Navigation";
import { Employee } from "../../utility/Employee";

export default function WithdrawAdvancedSalary() {
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<
    "password" | "withdraw" | null
  >(null);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [searchId, setSearchId] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [advance_salary, setAdvance_salary] = useState("");

  // -------------------- HANDLE ACTION CONFIRMATION --------------------

  const openWithdrawPopup = () => {
    if (!advance_salary) {
      setToast({
        open: true,
        type: "error",
        msg: "Please enter Advanced Salary",
      });
      return;
    }
    setConfirmType("withdraw");
    setConfirmOpen(true);
  };

  // -------------------- CONFIRM ACTION HANDLER --------------------

  const handleConfirm = async () => {
    if (!employee?.id) return;
    if (confirmType === "withdraw") return withdrawAdvancedSalary();
  };

  // -------------------- WITHDRAW ADVANCED SALARY --------------------

  const withdrawAdvancedSalary = async () => {
    const payload = {
      month: MONTHS.indexOf(month) + 1,
      year: year,
      advance_salary: advance_salary,
      employee_id: employee?.id,
    };

    try {
      setLoading(true);
        const res = await fetch(
          API_ENDPOINTS.caluculateUpdateSalary(employee?.id),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        setLoading(false);

      if (!res.ok) throw new Error("Failed to withdraw salary");

      setToast({
        open: true,
        type: "success",
        msg: "Advanced Salary Withdrawn Successfully",
      });
    } catch {
      setToast({
        open: true,
        type: "error",
        msg: "Failed to Withdraw Advanced Salary",
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Navigation />

      <SearchCardForEmployee
        title="Withdraw Advanced"
        role={userData?.role}
        searchId={searchId}
        setSearchId={(val) => {
          setSearchId(val);
          setShowDetails(false);
        }}
        setEmployee={setEmployee}
        setShowDetails={setShowDetails}
        placeholder="Enter Employee ID"
        buttonText="Search"
      />

      {/* ---------------- EMPLOYEE DETAILS + WITHDRAW UI ---------------- */}

      {showDetails && (
        <Card elevation={8} sx={{ m: 4, p: 3, borderRadius: 2, mt: 5 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Employee Details
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4,
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

            {/* -------- Month + Year Input -------- */}
            <Box sx={{ display: "flex", gap: 3, mt: 4 }}>
              <TextField
                select
                label="Select Month"
                value={month || MONTHS[new Date().getMonth()]}
                onChange={(e) => setMonth(e.target.value)}
                fullWidth
                disabled
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Enter Year"
                type="number"
                fullWidth
                value={year || new Date().getFullYear()}
                onChange={(e) => setYear(e.target.value)}
                disabled
              />
              <TextField
                label="Enter Advanced Money"
                type="number"
                fullWidth
                value={advance_salary}
                onChange={(e) => setAdvance_salary(e.target.value)}
              />
            </Box>

      {/* -------- BUTTON: Withdraw Salary -------- */}
            <Button
              variant="contained"
              color="error"
              sx={{ mt: 3 }}
              onClick={openWithdrawPopup}
              disabled={loading}
            >
              Withdraw Advanced Salary
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ---------------- CONFIRM DIALOG ---------------- */}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Typography>
            {confirmType === "withdraw" &&
              `Withdraw advanced salary for ${employee?.name} (${employee?.id}) for ${month} ${year}?`}
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined">
            No
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------------- TOAST ---------------- */}

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