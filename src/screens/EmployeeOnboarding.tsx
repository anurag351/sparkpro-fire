// EmployeeOnboard.tsx
import React, { useEffect, useState, forwardRef } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Slide,
  FormControl,
  InputLabel,
  MenuItem,
  Collapse,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  Typography,
  Alert,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Navigation from "../components/Navigation";
import { API_ENDPOINTS } from "../config";

type Role = "Employee" | "Manager" | "APD" | "PD" | "MD";

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

interface Props {
  currentUserRole?: Role;
}

const roleHierarchy: Record<Role | "Manager", Role[]> = {
  Employee: ["Employee"],
  Manager: ["Employee"],
  APD: ["Manager", "Employee"],
  PD: ["APD", "Manager", "Employee"],
  MD: ["PD", "APD", "Manager", "Employee"],
};

export default function EmployeeOnboard({
  currentUserRole = "Manager",
}: Props) {
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

  const [form, setForm] = useState<FormState>(initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeIDGenerated, setEmployeeIDGenerated] = useState(false);
  // Snackbar state
  const [toast, setToast] = useState<ToastState>(null);
  const [managers, setManagers] = useState<ManagerItem[]>([]);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const [employee, setEmployee] = useState<ManagerItem | null>(null);
  const readOnly = employeeIDGenerated; // Controls read-only state
  const [copyCheck, setCopyCheck] = useState(false);
  const [checkUpload, setCheckUpload] = useState(false);

  useEffect(() => {
    // TODO: replace with real API call
    fetchemployeeDetails();
    currentUserRole = userData.role;
  }, []);
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
  // Clean up preview URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  const onlyDigits = (value = "", maxLen: number) =>
    value.replace(/\D/g, "").slice(0, maxLen);

  const setField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleCopy = () => {
    if (employee && checkUpload) {
      navigator.clipboard.writeText(employee["id"]);
      setCopyCheck(true);
      alert("Password copied to clipboard");
      setEmployeeIDGenerated(false);
    }
    if (employee) {
      navigator.clipboard.writeText(employee["id"]);
      setCopyCheck(true);
      alert("Password copied to clipboard");
      setToast({
        open: true,
        type: "success",
        msg: "Password copied to clipboard",
      });
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setForm((p) => ({ ...p, file: f ?? null }));
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
    } else {
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
    }
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
    // revoke preview url if present
    if (preview) URL.revokeObjectURL(preview);
    setForm(initialState);
    setPreview(null);
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

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);

    const payload: Record<string, any> = {};

    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      const v = form[k];
      if (v === null || v === "") return;
      payload[k] = v;
    });

    try {
      const res = await fetch(API_ENDPOINTS.addEmployee(userData.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail || errorData?.message || `Error ${res.status}`;
        throw new Error(message);
      }
      setEmployeeIDGenerated(true);
      const data = await res.json();
      setEmployee(data);
      setForm((prev) => ({
        ...prev,
        id: data.id,
        name: payload.name || "",
        role: payload.role || "",
        manager_id: payload.manager_id || "",
        contact: payload.contact || "",
        salary_per_month: payload.salary_per_month?.toString() || "",
        overtime_charge_per_hour:
          payload.overtime_charge_per_hour?.toString() || "",
        deduct_per_hour: payload.deduct_per_hour?.toString() || "",
        deduct_per_day: payload.deduct_per_day?.toString() || "",
        aadhaar_number: payload.aadhaar_number || "",
      }));
      setToast({
        open: true,
        type: "success",
        msg: "Employee Onboarded Successfully",
      });
    } catch (err) {
      setToast({
        open: true,
        type: "error",
        msg:
          err instanceof Error
            ? err.message
            : "Failed Onboarded Please Try Again",
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
  const Transition = forwardRef(function Transition(props: any, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            {/* Form Section */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 3,
                }}
              >
                {/* Column 1 */}
                <Box sx={{ flex: 1 }}>
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

                {/* Column 2 */}
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Aadhaar Number"
                    value={form.aadhaar_number}
                    onChange={onAadhaarKey}
                    fullWidth
                    sx={{ mt: 5 }}
                    disabled={readOnly}
                  />

                  <TextField
                    label="Overtime Per Hour"
                    value={form.overtime_charge_per_hour}
                    onChange={(e) =>
                      onNumericKey("overtime_charge_per_hour", e)
                    }
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
                  {readOnly && (
                    <Box sx={{ mt: 6 }}>
                      <Typography variant="h6" sx={{ wordBreak: "break-all" }}>
                        {employee?.id}
                        <IconButton onClick={handleCopy} color="primary">
                          <ContentCopyIcon />
                        </IconButton>
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Buttons (row-reverse) */}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 3,
                  p: 3,
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
              {/* LEFT: File upload (30% width) */}
              {employeeIDGenerated && (
                <Box
                  sx={{
                    flex: { xs: 1, md: "0 0 30%" },
                    mt: { xs: 3, md: 3 },
                    width: { xs: "100%", md: "30%" },
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Collapse in={employeeIDGenerated}>
                    <Box
                      sx={{
                        border: "1px dashed grey",
                        borderRadius: 2,
                        p: 3,
                        textAlign: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Avatar
                        src={
                          preview ??
                          (form.passport_photo_filename
                            ? `${API_ENDPOINTS.updateEmployeePhoto(form.id)}/${
                                form.passport_photo_filename
                              }`
                            : "")
                        }
                        alt="passport"
                        sx={{
                          width: 199,
                          height: 246,
                          mb: 2,
                          bgcolor: preview ? "transparent" : "grey.100",
                        }}
                        variant="rounded"
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 2,
                          color: "text.secondary",
                          textAlign: "center",
                        }}
                      >
                        Passport size photo preview
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ mt: 2 }}
                      >
                        Choose File
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={handleFile}
                        />
                      </Button>

                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, borderRadius: 2 }}
                        disabled={!form.file}
                        onClick={async () => {
                          if (!form.file) {
                            setToast({
                              open: true,
                              type: "error",
                              msg: "Please select a file before uploading",
                            });
                            return;
                          }
                          try {
                            const uploadData = new FormData();
                            uploadData.append("file", form.file);

                            const uploadRes = await fetch(
                              API_ENDPOINTS.updateEmployeePhoto(form.id),
                              {
                                method: "POST",
                                body: uploadData,
                              }
                            );
                            if (!uploadRes.ok)
                              throw new Error("File upload failed");
                            const uploadJson = await uploadRes.json();

                            setForm((prev) => ({
                              ...prev,
                              passport_photo_filename: uploadJson.filename,
                            }));
                            setCheckUpload(true);
                            setToast({
                              open: true,
                              type: "success",
                              msg: "Photo uploaded successfully!",
                            });
                            if (copyCheck) {
                              setEmployeeIDGenerated(false);
                            } else {
                              alert(
                                "Please Copy and Save EmployeeID Before Leaving Page"
                              );
                            }
                          } catch (err) {
                            setToast({
                              open: true,
                              type: "error",
                              msg:
                                err instanceof Error
                                  ? err.message
                                  : "Upload failed. Please try again.",
                            });
                          } finally {
                            clearAll();
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </Box>
                  </Collapse>
                  {/* 🔽 Upload Button */}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>

        {/* Confirm Dialog */}
        <Dialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          TransitionComponent={Transition}
          keepMounted
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
