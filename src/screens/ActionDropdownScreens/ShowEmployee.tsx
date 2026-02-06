import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Card,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Employee } from "../../utility/Employee";
import { useToast } from "../../utility/ToastProvider";
import SearchCardForAllEmployeeByRole from "../../components/SearchCardForAllEmployeeByRole";
import Navigation from "../../components/Navigation";

const ShowEmployee: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = userData.role;

  const handleViewDetails = (employee: Employee) => {
    navigate("/employee-details", { state: { employee } });
  };

  return (
    <>
      <Navigation />
      {role && (
        <SearchCardForAllEmployeeByRole
          title="Show Employees"
          role={role as any}
          searchId={searchId}
          setSearchId={setSearchId}
          setShowDetails={setShowDetails}
          setEmployees={setEmployees}
          buttonText="Search"
        />
      )}
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {employees.length > 0 && (
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
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#b21640ff" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Overtime Charge</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    sx={{
                      backgroundColor: emp.is_active
                        ? "lightgreen"
                        : "lightcoral",
                    }}
                  >
                    <TableCell>{emp.id}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>{emp.contact}</TableCell>
                    <TableCell>
                      {emp.is_active ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight:
                          emp.salary_per_month > 25000 ? "bold" : "normal",
                        color:
                          emp.salary_per_month > 25000 ? "blue" : "inherit",
                      }}
                    >
                      {emp.salary_per_month}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight:
                          emp.overtime_charge_per_hour &&
                          emp.overtime_charge_per_hour > 50
                            ? "bold"
                            : "normal",
                        color:
                          emp.overtime_charge_per_hour &&
                          emp.overtime_charge_per_hour > 50
                            ? "red"
                            : "inherit",
                      }}
                    >
                      {emp.overtime_charge_per_hour || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleViewDetails(emp)}
                        size="small"
                        sx={{ width: 150 }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </>
  );
};

export default ShowEmployee;
