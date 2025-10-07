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

type Role = "Employee" | "Manager" | "APD" | "PD" | "MD";

const roleHierarchy: Record<Role | "Manager", Role[]> = {
  Employee: ["Employee"],
  Manager: ["Employee"],
  APD: ["Manager", "Employee"],
  PD: ["APD", "Manager", "Employee"],
  MD: ["PD", "APD", "Manager", "Employee"],
};

interface SearchCardProps {
  title: string;
  role: Role; // current user role
  searchId: string;
  setSearchId: (value: string) => void;
  onSearch: (role: string, id: string) => Promise<void> | void; // async search allowed
  placeholder?: string;
  buttonText?: string;
}

export default function SearchCardForEmployee({
  title,
  role,
  searchId,
  setSearchId,
  onSearch,
  placeholder = "Enter Employee ID",
  buttonText = "Search",
}: SearchCardProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // roleOptions handled inside
  const roleOptions = useMemo(() => {
    if (!role || role === "MD") return [];
    return roleHierarchy[role] || [];
  }, [role]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      await onSearch(selectedRole, searchId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={8}
      sx={{
        zIndex: 1200,
        m: 4,
        p: 3,
        borderRadius: 2,
        mt: 5,
      }}
    >
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          {/* 🔹 Role Dropdown (hidden if MD) */}
          {role !== "MD" && roleOptions.length > 0 && (
            <FormControl sx={{ minWidth: 150 }} size="small">
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
            label={placeholder}
            variant="outlined"
            size="small"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            sx={{ width: "250px" }}
          />

          {/* 🔹 Search Button with Loader */}
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ borderRadius: 3, px: 3, minWidth: 100 }}
            disabled={loading}
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
