// EmployeeOnboard.tsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Snackbar,
  TextField,
  Typography,
  Alert,
  IconButton,
  Box,
  Select,
} from "@mui/material";

import Navigation from "../../components/Navigation";
import { API_ENDPOINTS } from "../../config";
import AppLoader from "../../utility/AppLoader";
const EmployeePhotoUpload = lazy(
  () => import("../../components/EmployeePhotoUpload")
);
type Role = "Employee" | "Manager" | "APD" | "PD" | "MD" | "HR" | "CP" | "CAP";

interface ManagerItem {
  id: string;
  name: string;
  role: Role;
}

interface FormState {
  id: string;
  name: string;
  role: Role | "";
  manager_id: string | "";
  add_manager_id: string | ""; // NEW: additional manager dropdown
  contact: string;
  salary_per_month: string;
  overtime_charge_per_hour: string;
  deduct_per_hour: string;
  deduct_per_day: string;
  aadhaar_number: string;
  file: File | null;
  passport_photo_filename?: string | null;
}

type ToastState = {
  open: boolean;
  type: "success" | "error";
  msg: string;
} | null;

const roleHierarchy: Record<Role | "MD", Role[]> = {
  Employee: ["Employee"],
  Manager: ["Employee"],
  APD: ["Manager", "Employee"],
  HR: ["HR", "CP", "CAP", "APD"],
  PD: ["HR", "CP", "CAP", "APD", "Manager", "Employee"],
  MD: ["PD", "HR", "CP", "CAP", "APD", "Manager", "Employee"],
  CAP: [],
  CP: [],
};

export default function EmployeeOnboard() {
  const initialState: FormState = {
    id: "",
    name: "",
    role: "",
    manager_id: "",
    add_manager_id: "", // NEW initial
    contact: "",
    salary_per_month: "",
    overtime_charge_per_hour: "",
    deduct_per_hour: "",
    deduct_per_day: "",
    aadhaar_number: "",
    file: null,
    passport_photo_filename: null,
  };
  const [currentUserRole, setCurrentUserRole] = useState("Employee");
  const [form, setForm] = useState<FormState>(initialState);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeIDGenerated, setEmployeeIDGenerated] = useState(false);
  // Snackbar state
  const [toast, setToast] = useState<ToastState>(null);
  const [managers, setManagers] = useState<ManagerItem[]>([]);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const [employee, setEmployee] = useState<ManagerItem | null>(null);
  const [readOnly, setReadOnly] = useState(false); // Controls read-only
  const [copyCheck, setCopyCheck] = useState(false);
  const [checkUpload, setCheckUpload] = useState(false);

  useEffect(() => {
    setReadOnly(employeeIDGenerated);
  }, [employeeIDGenerated]);
  useEffect(() => {
    // TODO: replace with real API call
    fetchemployeeDetails();
    setCurrentUserRole(userData.role);
  }, [userData.role]);
  const fetchemployeeDetails = async () => {
    // TODO: replace with your real API
    const res = await fetch(API_ENDPOINTS.employeeDetailsByRole("all"));
    if (res.ok) {
      const data = await res.json();
      const nonEmployeeNames = data
        .filter((emp: any) => emp.role !== "Employee")
        .map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          role: emp.role,
        }));
      setManagers(nonEmployeeNames);
      setEmployeeIDGenerated(false);
    } else {
      setManagers([]);
    }
  };

  const onlyDigits = (value = "", maxLen: number) =>
    value.replace(/\D/g, "").slice(0, maxLen);

  const setField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleCopy = () => {
    if (!employee) return;

    navigator.clipboard
      .writeText(employee.id)
      .then(() => {
        setCopyCheck(true);
        setToast({
          open: true,
          type: "success",
          msg: "Employee ID copied to clipboard",
        });
      })
      .catch(() => {
        setToast({
          open: true,
          type: "error",
          msg: "Unable to copy ID to clipboard",
        });
      });
  };

  const onContactKey = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const v = onlyDigits(e.target.value, 10);
    setField("contact", v);
  };

  const onAadhaarKey = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const v = onlyDigits(e.target.value, 12);
    setField("aadhaar_number", v);
  };

  const onNumericKey = (
    field: keyof FormState,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const v = e.target.value.replace(/[^0-9.]/g, "");
    setField(field, v as FormState[typeof field]);
  };

  const clearAll = () => {
    setForm(initialState);
  };

  const availableRolesForCurrentUser = roleHierarchy[
    currentUserRole as Role
  ] ?? ["Employee"];

  const managerRoleOptions = (): ManagerItem[] => {
    if (!form.role) return [];
    if (form.role === "Employee")
      return managers.filter((m) => ["Manager", "PD", "APD"].includes(m.role));
    if (form.role === "Manager")
      return managers.filter((m) => ["PD", "APD"].includes(m.role));
    if (form.role === "APD")
      return managers.filter((m) => ["PD", "MD"].includes(m.role));
    if (form.role === "PD")
      return managers.filter((m) => ["MD"].includes(m.role));
    if (form.role === "MD") return [];
    return managers;
  };

  const submit = () => {
    // client side validations
    if (!form.name || !form.role || !form.contact || !form.aadhaar_number) {
      setToast({
        open: true,
        type: "error",
        msg: "Please fill required fields",
      });
      return;
    }
    if (form.contact && form.contact.length !== 10) {
      setToast({
        open: true,
        type: "error",
        msg: "Please Enter a valid Phone No",
      });
      return;
    }
    if (form.aadhaar_number && form.aadhaar_number.length !== 12) {
      setToast({
        open: true,
        type: "error",
        msg: "Please Enter a valid Aadhaar No",
      });
      return;
    }
    setShowConfirm(true);
  };
  const reset = () => {
    if (employeeIDGenerated && copyCheck && checkUpload) {
      clearAll();
      setCheckUpload(false);
      setCopyCheck(false);
      setEmployeeIDGenerated(false);
      setToast({
        open: true,
        type: "success",
        msg: "Reseting Page You can add New Details",
      });
      return;
    }
    if (!copyCheck) {
      setToast({
        open: true,
        type: "success",
        msg: "Please Copy and Save the Employee ID",
      });
      return;
    }
    if (!checkUpload) {
      setToast({
        open: true,
        type: "success",
        msg: "Please Upload the picture of the employee or Select Upload Pic Later",
      });
      return;
    }
  };
  const resetWithOutUpload = async () => {
    if (employeeIDGenerated && copyCheck) {
      clearAll();
      setCheckUpload(false);
      setCopyCheck(false);
      setEmployeeIDGenerated(false);
      setToast({
        open: true,
        type: "success",
        msg: "Resseting Page You can add New Details",
      });
      return;
    }
    if (!copyCheck) {
      setToast({
        open: true,
        type: "success",
        msg: "Please Copy and Save the Employee ID",
      });
      return;
    }
  };
  const confirmSubmit = async () => {
    setShowConfirm(false);
    const payload: Record<string, any> = {};

    for (const key of Object.keys(form) as (keyof FormState)[]) {
      const value = form[key];
      if (value !== null && value !== "") {
        payload[key] = value;
      }
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.addEmployee(userData.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.detail || data?.message || `Error ${res.status}`;
        throw new Error(message);
      }

      setEmployeeIDGenerated(true);
      setEmployee(data);

      setForm((prev) => ({
        ...prev,
        id: data.id,
        name: data.name ?? payload.name ?? "",
        role: data.role ?? payload.role ?? "",
        manager_id: data.manager_id ?? payload.manager_id ?? "",
        contact: data.contact ?? payload.contact ?? "",
        salary_per_month:
          (data.salary_per_month ?? payload.salary_per_month)?.toString() || "",
        overtime_charge_per_hour:
          (
            data.overtime_charge_per_hour ?? payload.overtime_charge_per_hour
          )?.toString() || "",
        deduct_per_hour:
          (data.deduct_per_hour ?? payload.deduct_per_hour)?.toString() || "",
        deduct_per_day:
          (data.deduct_per_day ?? payload.deduct_per_day)?.toString() || "",
        aadhaar_number: data.aadhaar_number ?? payload.aadhaar_number ?? "",
      }));

      setToast({
        open: true,
        type: "success",
        msg: "Employee onboarded successfully.",
      });
      return data;
    } catch (err) {
      setToast({
        open: true,
        type: "error",
        msg:
          err instanceof Error
            ? err.message
            : "Onboarding failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Select change typed
  const onRoleChange = (e: SelectChangeEvent) => {
    const value = e.target.value as Role | "";
    setField("role", value);
    // If role changes to MD, clear manager_id (MD cannot have manager)
    if (value === "MD") {
      setField("manager_id", "");
      setField("add_manager_id", ""); // clear new manager selection too
    }
  };

  return (
    <>
      <Navigation />
      <Card
        elevation={8}
        sx={{
          maxWidth: 1200,
          margin: { xs: 2, sm: 3, md: "20px auto" },
          borderRadius: 2,
          p: { xs: 2, md: 3 },
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, mb: { xs: 2, md: 3 } }}
          >
            Employee Onboarding
          </Typography>
          {/* Main layout: form + upload */}
          {/* Form Section */}
          {readOnly && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "center",
                }}
              >
                {readOnly && (
                  <Typography variant="h6" sx={{ wordBreak: "break-all" }}>
                    {employee?.id}
                    <IconButton onClick={handleCopy} color="primary">
                      <ContentCopyIcon />
                    </IconButton>
                  </Typography>
                )}
                <Suspense
                  fallback={
                    <div style={{ textAlign: "center", marginTop: 40 }}>
                      <AppLoader type="skeleton"></AppLoader>
                    </div>
                  }
                >
                  {employeeIDGenerated && (
                    <EmployeePhotoUpload
                      employeeId={form.id}
                      existingPhotoFilename={form.passport_photo_filename}
                      file={form.file}
                      setCheckUpload={setCheckUpload}
                      apiEndpoint={API_ENDPOINTS.updateEmployeePhoto}
                      show={employeeIDGenerated}
                      onFileSelect={(file) =>
                        setForm((prev) => ({ ...prev, file }))
                      }
                      onUploadSuccess={(filename) =>
                        setForm((prev) => ({
                          ...prev,
                          passport_photo_filename: filename,
                        }))
                      }
                      onUploadFail={(error) =>
                        console.error("Upload failed:", error)
                      }
                    />
                  )}
                </Suspense>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "flex-end",
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 2,
                  mt: 5,
                }}
              >
                {readOnly && (
                  <Button
                    onClick={resetWithOutUpload}
                    variant="contained"
                    color="primary"
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      height: "50px",
                    }}
                  >
                    Upload Pic Later
                  </Button>
                )}
                {readOnly && (
                  <Button
                    onClick={reset}
                    variant="contained"
                    color="secondary"
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      height: "50px",
                    }}
                  >
                    Onboard Another Employee
                  </Button>
                )}
              </Box>
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mt: 5,
            }}
          >
            <TextField
              label="Name *"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              fullWidth
              sx={{ mt: 5 }}
              disabled={readOnly}
            />
            <TextField
              label="Contact"
              value={form.contact}
              onChange={onContactKey}
              fullWidth
              sx={{ mt: 5 }}
              disabled={readOnly}
            />
            <TextField
              label="Aadhaar Number"
              value={form.aadhaar_number}
              onChange={onAadhaarKey}
              fullWidth
              sx={{ mt: 5 }}
              disabled={readOnly}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mt: 5,
            }}
          >
            <FormControl fullWidth sx={{ mt: 5 }}>
              <InputLabel id="role-label">Role *</InputLabel>
              <Select
                labelId="role-label"
                value={form.role}
                label="Role *"
                onChange={onRoleChange}
                disabled={readOnly}
              >
                <MenuItem value="">Select role</MenuItem>
                {availableRolesForCurrentUser.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Existing Manager select (visibility follows original requirement) */}
            {form.role && (
              <FormControl fullWidth sx={{ mt: 5 }}>
                <InputLabel id="manager-label">Manager</InputLabel>
                <Select
                  labelId="manager-label"
                  label="Manager"
                  value={form.manager_id}
                  onChange={(e: SelectChangeEvent) =>
                    setField("manager_id", e.target.value)
                  }
                  disabled={readOnly}
                >
                  <MenuItem value="">Select manager</MenuItem>
                  {managerRoleOptions().map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Monthly Salary"
              value={form.salary_per_month}
              onChange={(e) => onNumericKey("salary_per_month", e)}
              fullWidth
              sx={{ mt: 5 }}
              disabled={readOnly}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mt: 5,
            }}
          >
            <TextField
              label="Overtime Per Hour"
              value={form.overtime_charge_per_hour}
              onChange={(e) => onNumericKey("overtime_charge_per_hour", e)}
              fullWidth
              sx={{ mt: 5 }}
              disabled={readOnly}
            />

            <TextField
              label="Deduct Per Day"
              value={form.deduct_per_day}
              onChange={(e) => onNumericKey("deduct_per_day", e)}
              fullWidth
              sx={{ mt: 5 }}
              disabled={readOnly}
            />
            <TextField
              label="Deduct Per Hour"
              value={form.deduct_per_hour}
              onChange={(e) => onNumericKey("deduct_per_hour", e)}
              fullWidth
              sx={{ mt: 5 }}
              disabled={readOnly}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 2,
              mt: 3,
            }}
          >
            {!readOnly && (
              <Button
                onClick={clearAll}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  px: 3,
                  height: "50px",
                }}
              >
                Clear All
              </Button>
            )}
            {!readOnly && (
              <Button
                onClick={submit}
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: 3,
                  px: 3,
                  height: "50px",
                }}
                disabled={loading}
              >
                Onboard
              </Button>
            )}
          </Box>
        </CardContent>

        {/* Confirm Dialog */}
        <Dialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          maxWidth="xs"
          fullWidth
        >
          {/* Header */}
          <DialogTitle sx={{ fontWeight: 600, pb: 1, textAlign: "center" }}>
            Please Confirm
          </DialogTitle>
          <Divider sx={{ mx: 2 }} />

          {/* Body */}
          <DialogContent sx={{ py: 3 }}>
            <Typography align="center" sx={{ fontSize: "0.95rem" }}>
              Please confirm if all details are correct before proceeding.
            </Typography>
          </DialogContent>
          <Divider sx={{ mx: 2 }} />

          {/* Footer */}
          <DialogActions
            sx={{
              justifyContent: "center",
              gap: 2,
              py: 2,
            }}
          >
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outlined"
              sx={{ px: 3, borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSubmit}
              variant="contained"
              color="primary"
              sx={{ px: 4, borderRadius: 2 }}
            >
              OK
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
              severity={toast.type as "success" | "error"}
              onClose={() => setToast(null)}
              sx={{ width: "100%" }}
            >
              {toast.msg}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Card>
    </>
  );
}
