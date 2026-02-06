// components/shared/SearchCard.tsx
import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useToast } from "../utility/ToastProvider";
import { API_ENDPOINTS } from "../config";
import { Employee } from "../utility/Employee";

type Role = "Employee" | "Manager" | "APD" | "PD" | "MD" | "HR" | "CA" | "CAP";

const roleHierarchy: Record<Role | "Manager", Role[]> = {
  Employee: ["Employee"],
  Manager: ["Employee"],
  APD: ["Manager", "Employee", "CA", "CAP"],
  HR: ["Manager", "Employee", "CA", "CAP"],
  CA: ["Manager", "Employee"],
  CAP: ["Manager", "Employee"],
  PD: ["APD", "Manager", "Employee", "CA", "CAP"],
  MD: ["PD", "APD", "Manager", "Employee", "CA", "CAP"],
};

interface SearchCardProps {
  title: string;
  role: Role; // current user role
  searchId: string;
  setSearchId: (value: string) => void;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  placeholder?: string;
  buttonText?: string;
}

export default function SearchCardForAllEmployeeByRole({
  title,
  role,
  searchId,
  setSearchId,
  setEmployees,
  setShowDetails,
  placeholder = "Enter Employee ID",
  buttonText = "Search",
}: SearchCardProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [aadhaar, setAadhaar] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [managerId, setManagerId] = useState<string>("");
  const [activeStatus, setActiveStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [employeeName, setEmployeeName] = useState<string>(""); // Add this line
  const toast = useToast();
  // roleOptions handled inside
  const roleOptions = useMemo(() => {
    if (!role) return [];
    return roleHierarchy[role] || [];
  }, [role]);

  const handleReset = () => {
    setSearchId("");
    setSelectedRole("");
    setAadhaar("");
    setContact("");
    setManagerId("");
    setActiveStatus("");
    setEmployeeName("");
  };

  const handleSearchEmployee = async () => {
    // Employee ID is non-mandatory
    setLoading(true);
    try {
      let res: Response;
      let data: Employee | Employee[];
      if (!selectedRole) {
        toast.error("Please select a role to search");
        return;
      } else {
        // Fetch single employee
        if (role == "MD" && selectedRole == "ALL") {
          res = await fetch(API_ENDPOINTS.employeeDetailsByRole("all"));
        } else {
          res = await fetch(API_ENDPOINTS.employeeDetailsAdvancedSearch(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: searchId.toUpperCase() || null,
              is_active: activeStatus ? activeStatus : null,
              role: selectedRole,
              name: employeeName || null,
              aadhaar_number: aadhaar || null,
              contact: contact || null,
              manager_id: managerId || null,
            }),
          });
        }
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const message =
            errorData?.detail || errorData?.message || `Error ${res.status}`;
          throw new Error(message);
        }

        data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setShowDetails(true);
          setEmployees(data as Employee[]);
        } else {
          setShowDetails(false);
        }
        //show rest of the page
        toast.success("Employee details loaded successfully");
      }
    } catch (error) {
      toast.error("Employee not found or error fetching data");
      setEmployees([]);
      setShowDetails(false);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          {title}
        </Typography>

        {/* Search Layout */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 5,
          }}
        >
          {/* 🔹 Role Dropdown */}
          {roleOptions.length > 0 && (
            <FormControl
              size="small"
              sx={{
                width: { xs: "100%", sm: "48%", md: "32%" },
              }}
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                value={selectedRole}
                label="Role"
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roleOptions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            fullWidth
            label={placeholder}
            variant="outlined"
            size="small"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "48%", md: "32%" },
            }}
          />

          {/* 🔹 Employee Name Field */}
          <TextField
            fullWidth
            label="Employee Name"
            variant="outlined"
            size="small"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)} // Update this line
            sx={{
              width: { xs: "100%", sm: "48%", md: "32%" },
            }}
          />

          {/* 🔹 Aadhaar Card Field */}
          <TextField
            fullWidth
            label="Aadhaar Number"
            variant="outlined"
            size="small"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "48%", md: "32%" },
            }}
          />

          {/* 🔹 Contact Field */}
          <TextField
            fullWidth
            label="Contact"
            variant="outlined"
            size="small"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "48%", md: "32%" },
            }}
          />

          {/* 🔹 Manager ID Field */}
          <TextField
            fullWidth
            label="Manager ID"
            variant="outlined"
            size="small"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "48%", md: "32%" },
            }}
          />

          {/* 🔹 Active Employee Dropdown */}
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: "48%", md: "32%" },
            }}
          >
            <InputLabel id="active-label">Active Status</InputLabel>
            <Select
              labelId="active-label"
              value={activeStatus}
              label="Active Status"
              onChange={(e) => setActiveStatus(e.target.value)}
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* ======================== BUTTONS ======================== */}
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
          {/* 🔹 Search Button */}
          {/* 🔹 Reset Button */}
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              borderRadius: 3,
              px: 3,
              minWidth: { xs: "100%", sm: 120 },
              height: 40,
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleSearchEmployee}
            disabled={loading}
            sx={{
              borderRadius: 3,
              px: 3,
              minWidth: { xs: "100%", sm: 120 },
              height: 40,
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              buttonText
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
