import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Chip,
  Dialog,
  Skeleton,
} from "@mui/material";
import { Employee } from "../utility/Employee";
import Navigation from "../components/Navigation";
import { API_ENDPOINTS } from "../config";

const EmployeeDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const employee: Employee = location.state?.employee;

  const [openImage, setOpenImage] = useState(false);
  const [loading] = useState(false); // future-proof

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No employee data found.</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  const handleDownload = () => {
    const link = document.createElement("a");
    if (!employee.passport_photo_filename) {
      alert("No photo available for download.");
      return;
    }
    link.href = employee.passport_photo_filename;
    link.download = `${employee.name}_photo`;
    link.click();
  };

  return (
    <>
      <Navigation />

      <Card
        elevation={10}
        sx={{
          m: { xs: 2, md: 4 },
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          transition: "0.3s",
          "&:hover": { boxShadow: 14 },
        }}
      >
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Employee Details
        </Typography>

        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* PROFILE IMAGE */}
            <Box sx={{ textAlign: "center", mr: { xs: 0, md: 25 } }}>
              {loading ? (
                <Skeleton variant="rounded" width={180} height={220} />
              ) : (
                <Avatar
                  src={
                    employee.passport_photo_filename
                      ? `${API_ENDPOINTS.showPhoto(
                          employee.passport_photo_filename,
                        )}`
                      : "/placeholder.png"
                  }
                  alt={employee.name}
                  variant="rounded"
                  onClick={() => setOpenImage(true)}
                  sx={{
                    width: { xs: 200, md: 250 },
                    height: { xs: 250, md: 300 },
                    borderRadius: 2,
                    boxShadow: 4,
                    cursor: "pointer",
                    bgcolor: "#f0f0f0",
                    color: "#9e9e9e",
                    fontSize: 64,
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.08)",
                    },
                  }}
                >
                  {!employee.passport_photo_filename && "👤"}
                </Avatar>
              )}

              {/* <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                disabled={!employee.passport_photo_filename}
                onClick={handleDownload}
              >
                Download Photo
              </Button> */}
            </Box>

            {/* DETAILS */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <Detail label="Employee ID" value={employee.id} />
                <Detail label="Name" value={employee.name || "N/A"} />
                <Detail label="Role" value={employee.role || "N/A"} />
                <Detail label="Contact" value={employee.contact || "N/A"} />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={employee.is_active ? "Active" : "Inactive"}
                    color={employee.is_active ? "success" : "error"}
                    size="small"
                    sx={{ mt: 0.5, ml: 2 }}
                  />
                </Box>

                <Detail
                  label="Manager ID"
                  value={employee.manager_id || "N/A"}
                />
                <Detail
                  label="Salary / Month"
                  value={`₹ ${employee.salary_per_month || "N/A"}`}
                />
                <Detail
                  label="Overtime / Hour"
                  value={employee.overtime_charge_per_hour ?? "N/A"}
                />
                <Detail
                  label="Deduct / Hour"
                  value={employee.deduct_per_hour ?? "N/A"}
                />
                <Detail
                  label="Deduct / Day"
                  value={employee.deduct_per_day ?? "N/A"}
                />
                <Detail
                  label="Aadhaar Number"
                  value={employee.aadhaar_number || "N/A"}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Go Back
          </Button>
        </CardContent>
      </Card>

      {/* IMAGE PREVIEW MODAL */}
      <Dialog
        open={openImage}
        onClose={() => setOpenImage(false)}
        maxWidth="sm"
      >
        <Box sx={{ p: 2 }}>
          <img
            src={employee.passport_photo_filename}
            alt="Employee"
            style={{
              width: "100%",
              borderRadius: 8,
            }}
          />
        </Box>
      </Dialog>
    </>
  );
};

/* Reusable detail row */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500}>
      {value}
    </Typography>
  </Box>
);

export default EmployeeDetails;
