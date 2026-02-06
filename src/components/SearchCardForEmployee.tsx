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
  setEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  placeholder?: string;
  buttonText?: string;
}

export default function SearchCardForEmployee({
  title,
  role,
  searchId,
  setSearchId,
  setEmployee,
  setShowDetails,
  placeholder = "Enter Employee ID",
  buttonText = "Search",
}: SearchCardProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  // roleOptions handled inside
  const roleOptions = useMemo(() => {
    if (!role || role === "MD") return [];
    return roleHierarchy[role] || [];
  }, [role]);

  const handleSearchEmployee = async (): Promise<void> => {
    if (!searchId.trim()) {
      toast.error("Please enter Employee ID");
      return;
    }
    setLoading(true);
    try {
      let res: Response;
      if (role == "MD") {
        res = await fetch(
          API_ENDPOINTS.employeeDetails(searchId.toUpperCase()),
        );
      } else {
        res = await fetch(
          API_ENDPOINTS.employeeDetailsByIDandRole(
            searchId.toUpperCase(),
            selectedRole,
          ),
        );
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message =
          errorData?.detail || errorData?.message || `Error ${res.status}`;
        throw new Error(message);
      }

      const data = await res.json();
      setEmployee(data);
      if (data && data.id) {
        setShowDetails(true);
      }
      //show rest of the page
      toast.success("Employee details loaded successfully");
    } catch {
      toast.error("Employee not found or error fetching data");
      setEmployee(null);
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
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mt: 5,
          }}
        >
          {/* 🔹 Role Dropdown */}
          {role !== "MD" && roleOptions.length > 0 && (
            <FormControl
              size="small"
              sx={{
                minWidth: { sm: 200, md: 250 },
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

          {/* 🔹 Employee ID Field */}
          <TextField
            fullWidth
            label={placeholder}
            variant="outlined"
            size="small"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "250px" },
            }}
          />

          {/* 🔹 Search Button */}
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
