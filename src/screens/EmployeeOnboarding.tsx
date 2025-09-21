// EmployeeOnboard.tsx
import React, { useEffect, useState } from "react";
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Navigation from "../components/Navigation";

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

  useEffect(() => {
    // TODO: replace with real API call
    setManagers([
      { id: "MGR1", name: "Ramesh", role: "Manager" },
      { id: "APD1", name: "Sita", role: "APD" },
      { id: "PD1", name: "Amit", role: "PD" },
      { id: "MD1", name: "Boss", role: "MD" },
    ]);
  }, []);

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
    if (form.role === "Manager")
      return managers.filter((m) => ["PD", "APD"].includes(m.role));
    if (form.role === "APD")
      return managers.filter((m) => ["PD"].includes(m.role));
    if (form.role === "PD")
      return managers.filter((m) => ["MD"].includes(m.role));
    if (form.role === "MD") return [];
    return managers;
  };

  const submit = () => {
    // client side validations
    if (!form.id || !form.name || !form.role) {
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

    const data = new FormData();
    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      const v = form[k];
      if (v === null || v === "") return;
      if (k === "file") {
        if (form.file) data.append("file", form.file);
        return;
      }
      data.append(k, String(v));
    });

    try {
      const res = await fetch("/employees/", { method: "POST", body: data });
      if (!res.ok) throw new Error("Failed");

      setToast({
        open: true,
        type: "success",
        msg: "Employee Onboarded Successfully",
      });
      clearAll();
    } catch (err) {
      setToast({
        open: true,
        type: "error",
        msg: "Failed Onboarded Please Try Again",
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
          zIndex: 1300,
          maxWidth: 1100,
          margin: "20px auto",
          borderRadius: 2,
          bgcolor: "background.paper",
          p: 2,
          boxShadow: 6,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 600, ml: 2 }}
          >
            Employee Onboarding
          </Typography>

          <Box sx={{ display: "flex", gap: 5 }}>
            {/* LEFT: File upload (30% width) */}
            {employeeIDGenerated && (
              <Box
                sx={{
                  flex: "0 0 30%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  // padding & margin of 3 as requested
                  p: 3,
                  m: 2,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1px dashed",
                    borderColor: "grey.300",
                    py: 3,
                    px: 2,
                    borderRadius: 1,
                  }}
                >
                  <Avatar
                    src={preview ?? ""}
                    alt="passport"
                    sx={{
                      width: 160,
                      height: 170,
                      mb: 2,
                      bgcolor: preview ? "transparent" : "grey.100",
                    }}
                    variant="rounded"
                  />
                  <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                    Upload Photo
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleFile}
                    />
                  </Button>

                  <Typography
                    variant="caption"
                    sx={{ mt: 5, color: "text.secondary", textAlign: "center" }}
                  >
                    Passport size photo preview
                  </Typography>
                </Box>
              </Box>
            )}

            {/* RIGHT: Form fields (70% width) */}
            <Box>
              {/* Grid container with gutter spacing=2 between columns */}
              <Grid container spacing={9} sx={{ ml: 2 }}>
                {/* Column 1 */}
                <Grid item xs={12} md={6} {...({} as any)}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <TextField
                      label="Name *"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      fullWidth
                      sx={{ mt: 5 }}
                    />
                    <TextField
                      label="Contact"
                      value={form.contact}
                      onChange={onContactKey}
                      fullWidth
                      sx={{ mt: 5 }}
                    />
                    <FormControl fullWidth sx={{ mt: 5 }}>
                      <InputLabel id="role-label">Role *</InputLabel>
                      <Select
                        labelId="role-label"
                        value={form.role}
                        label="Role *"
                        onChange={onRoleChange}
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
                    />
                  </Box>
                </Grid>

                {/* Column 2 */}
                <Grid item xs={12} md={6} {...({} as any)}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <TextField
                      label="Aadhaar Number"
                      value={form.aadhaar_number}
                      onChange={onAadhaarKey}
                      fullWidth
                      sx={{ mt: 5 }}
                    />

                    <TextField
                      label="Overtime Per Hour"
                      value={form.overtime_charge_per_hour}
                      onChange={(e) =>
                        onNumericKey("overtime_charge_per_hour", e)
                      }
                      fullWidth
                      sx={{ mt: 5 }}
                    />

                    <TextField
                      label="Deduct Per Day"
                      value={form.deduct_per_day}
                      onChange={(e) => onNumericKey("deduct_per_day", e)}
                      fullWidth
                      sx={{ mt: 5 }}
                    />
                    <TextField
                      label="Deduct Per Hour"
                      value={form.deduct_per_hour}
                      onChange={(e) => onNumericKey("deduct_per_hour", e)}
                      fullWidth
                      sx={{ mt: 5 }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Buttons (row-reverse) */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 5,
                  mr: 16,
                }}
              >
                <Button
                  onClick={clearAll}
                  variant="outlined"
                  sx={{ borderRadius: 3, px: 3 }}
                >
                  Clear All
                </Button>
                <Button
                  onClick={submit}
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 3, px: 3 }}
                  disabled={loading}
                >
                  Onboard
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>

        {/* Confirm Dialog */}
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
          <DialogTitle>Please Confirm</DialogTitle>
          <DialogContent>
            <Typography>
              Please Confirm If All Detail are Correct Then Proceed
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={confirmSubmit} variant="contained">
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
