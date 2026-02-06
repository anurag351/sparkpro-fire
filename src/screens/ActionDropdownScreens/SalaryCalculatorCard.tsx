import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useToast } from "../../utility/ToastProvider";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  MonetizationOn,
  AddCard,
  CurrencyRupee,
  RemoveCircle,
} from "@mui/icons-material";
import Navigation from "../../components/Navigation";
import { API_ENDPOINTS } from "../../config";

export default function SalaryCalculatorCard() {
  const toast = useToast();
  const salaryRows = [
    {
      label: "Basic Salary",
      valueKey: "basic_salary",
      icon: <MonetizationOn sx={{ color: "#1976d2" }} />,
    },
    {
      label: "Allowances",
      valueKey: "allowances",
      icon: <AddCard sx={{ color: "#00796b" }} />,
    },
    // {
    //   label: "Overtime Hours",
    //   valueKey: "overtime_hours",
    //   icon: <AccessTime sx={{ color: "#f57c00" }} />,
    // },
    // {
    //   label: "Overtime Rate",
    //   valueKey: "overtime_rate",
    //   icon: <CurrencyRupee sx={{ color: "#6a1b9a" }} />,
    // },
    {
      label: "Overtime Salary",
      valueKey: "overtime_salary",
      icon: <CurrencyRupee sx={{ color: "#6a1b9a" }} />,
    },
    {
      label: "Deductions",
      valueKey: "deductions",
      icon: <RemoveCircle sx={{ color: "#d32f2f" }} />,
    },
    {
      label: "Advanced Salary",
      valueKey: "advance_salary",
      icon: <RemoveCircle sx={{ color: "#d32f2f" }} />,
    },
  ];

  const months = [
    { name: "January", value: 1 },
    { name: "February", value: 2 },
    { name: "March", value: 3 },
    { name: "April", value: 4 },
    { name: "May", value: 5 },
    { name: "June", value: 6 },
    { name: "July", value: 7 },
    { name: "August", value: 8 },
    { name: "September", value: 9 },
    { name: "October", value: 10 },
    { name: "November", value: 11 },
    { name: "December", value: 12 },
  ];

  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [salaryData, setSalaryData] = useState<any>(null);

  // -----------------------------
  // VALIDATION
  // -----------------------------
  const validateInputs = () => {
    if (!employeeId.trim()) {
      toast.error("Please enter a valid Employee ID");
      return false;
    }
    if (!month) {
      toast.error("Please select month");
      return false;
    }
    if (!year || year.length !== 4 || isNaN(Number(year))) {
      toast.error("Please enter valid 4-digit year");
      return false;
    }
    return true;
  };

  // -----------------------------
  // API CALL: CALCULATE SALARY
  // -----------------------------
  const handleCalculateSalary = async () => {
    if (!validateInputs()) return;

    setLoading(true);

    try {
      const payload = {
        month: month.value,
        year: year,
        advance_salary: 0,
        employee_id: employeeId,
      };
      const res = await fetch(
        API_ENDPOINTS.caluculateUpdateSalary(employeeId),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setSalaryData(data);
      toast.success("Salary calculated successfully");
    } catch {
      toast.error("Failed to calculate salary");
      setSalaryData(null);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // CLEAR FORM
  // -----------------------------
  const handleClear = () => {
    setEmployeeId("");
    setMonth(months[new Date().getMonth()]);
    setYear(new Date().getFullYear().toString());
    setSalaryData(null);
  };

  // -----------------------------
  // DOWNLOAD PDF
  // -----------------------------
  const handleDownloadSlip = () => {
    if (!salaryData) return;
    const url = API_ENDPOINTS.generateSalarySlip(employeeId, year, month.value);
    window.open(url, "_blank");
  };

  return (
    <>
      <Navigation />
      {/* ==================== INPUT CARD ==================== */}
      <Card
        elevation={9}
        sx={{
          zIndex: 1200,
          m: 4,
          p: 3,
          borderRadius: 2,
          mt: 5,
        }}
      >
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              textAlign: { xs: "center", sm: "left" },
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
            }}
          >
            Calculate & Generate Salary
          </Typography>

          {/* INPUTS USING BOX ONLY */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mt: 5,
            }}
          >
            {/* Employee ID */}
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              />
            </Box>

            {/* Month */}
            <Box sx={{ flex: 1 }}>
              <TextField
                select
                fullWidth
                label="Month"
                value={month?.value || months[new Date().getMonth()].value}
                onChange={(e) =>
                  setMonth(
                    months.find((m) => m.value === Number(e.target.value)) ||
                      month,
                  )
                }
              >
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Year */}
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Year"
                inputProps={{ maxLength: 4 }}
                value={year || new Date().getFullYear()}
                onChange={(e) => setYear(e.target.value)}
              />
            </Box>
          </Box>

          {/* BUTTONS */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mt: 3,
            }}
          >
            {/* Clear Button */}
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ height: 40, borderRadius: 3, p: 3 }}
                onClick={handleClear}
              >
                Clear
              </Button>
            </Box>

            {/* Calculate & Generate Salary Button */}
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  height: 40,
                  p: 3,
                  borderRadius: 3,
                }}
                onClick={handleCalculateSalary}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Calculate & Generate Salary"
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ==================== SALARY RESULT CARD ==================== */}
      {salaryData && (
        <Card
          elevation={9}
          sx={{
            zIndex: 1200,
            m: 4,
            p: 3,
            borderRadius: 2,
            mt: 5,
          }}
        >
          {/* Download Button */}

          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                textAlign: { xs: "center", sm: "left" },
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
              }}
              mb={2}
            >
              Salary Details
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", sm: "row" },
                alignItems: { xs: "flex-end", sm: "center" },
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                color="success"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderRadius: 3,
                  px: 3,
                  minWidth: { xs: "100%", sm: 170 },
                  height: 40,
                  fontWeight: 600,
                }}
                onClick={handleDownloadSlip}
              >
                <FileDownloadOutlinedIcon sx={{ fontSize: 22 }} />
                Salary Slip
              </Button>
            </Box>
            {/* Salary Fields (BOX layout only) */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: "#f9f9f9",
                border: "1px solid #e0e0e0",
              }}
            >
              {salaryRows.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    padding: "12px 10px",
                    borderRadius: 2,
                    borderBottom:
                      idx !== salaryRows.length - 1
                        ? "1px solid #e5e5e5"
                        : "none",
                    cursor: "pointer",

                    /* ⭐ Hover Animation using MUI CSS only */
                    transition:
                      "transform .2s ease, background-color .2s ease, box-shadow .2s ease",
                    "&:hover": {
                      backgroundColor: "#ffffff",
                      transform: "scale(1.02)",
                      boxShadow: "0px 3px 12px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {/* Left Section */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {item.icon}
                    <Typography
                      sx={{ fontWeight: 600, color: "#333", fontSize: "1rem" }}
                    >
                      {item.label}
                    </Typography>
                  </Box>

                  {/* Right Section (Value) */}
                  <Typography
                    sx={{
                      color: "#444",
                      fontSize: "1rem",
                      mt: { xs: 0.5, sm: 0 },
                      fontWeight: 500,
                    }}
                  >
                    {item.valueKey === "overtime_rate"
                      ? `₹${salaryData[item.valueKey]}`
                      : [
                            "basic_salary",
                            "allowances",
                            "deductions",
                            "advance_salary",
                          ].includes(item.valueKey)
                        ? `₹${salaryData[item.valueKey]}`
                        : `₹${salaryData[item.valueKey]}`}
                  </Typography>
                </Box>
              ))}
            </Box>
            {/* NET SALARY */}
            <Box
              sx={{
                background: "#380befff",
                color: "white",
                padding: 2,
                borderRadius: 3,
                fontSize: "1.4rem",
                textAlign: "center",
                mt: 3,
                fontWeight: "bold",
              }}
            >
              Net Salary: ₹{salaryData.net_salary}
            </Box>
            <Box
              sx={{
                background: "#4CAF50",
                color: "white",
                padding: 2,
                borderRadius: 3,
                fontSize: "1.4rem",
                textAlign: "center",
                mt: 3,
                fontWeight: "bold",
              }}
            >
              Payable Salary: ₹
              {salaryData.net_salary - salaryData.advance_salary}
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
}
