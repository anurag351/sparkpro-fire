import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

/* 🔹 Step 1: Define the toast state type */
export interface ToastState {
  open: boolean;
  type: "success" | "error" | "info" | "warning";
  msg: string;
}

/* 🔹 Step 2: Default toast */
const defaultToast: ToastState = {
  open: false,
  type: "success",
  msg: "",
};

/* 🔹 Step 3: Context interface */
interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
  close: () => void;
}

/* 🔹 Step 4: Create context */
const ToastContext = createContext<ToastContextType | null>(null);

/* 🔹 Step 5: Provider */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastState>(defaultToast);

  const showToast = useCallback((type: ToastState["type"], msg: string) => {
    setToast({ open: true, type, msg });
  }, []);

  const close = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const api: ToastContextType = {
    success: (msg) => showToast("success", msg),
    error: (msg) => showToast("error", msg),
    info: (msg) => showToast("info", msg),
    warning: (msg) => showToast("warning", msg),
    close,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* 🔹 Step 6: Global Snackbar UI */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.type}
          onClose={close}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

/* 🔹 Step 7: Custom hook for easy usage */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};
