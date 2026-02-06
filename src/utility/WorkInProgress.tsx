import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import Navigation from "../components/Navigation";
const WorkInProgress: React.FC = () => {
  return (
    <>
      <Navigation />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e3f2fd, #f9f9f9)",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            animation: "fadeIn 1.2s ease-in-out",
          }}
        >
          {/* Icon Animation */}
          <Box
            sx={{
              fontSize: 120,
              color: "primary.main",
              animation: "bounce 2s infinite",
            }}
          >
            <ConstructionIcon fontSize="inherit" />
          </Box>

          {/* Title */}
          <Typography variant="h3" fontWeight={700} sx={{ mt: 2 }}>
            Work in Progress
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1, maxWidth: 420, mx: "auto" }}
          >
            This feature is currently under development. Please check back soon.
          </Typography>

          {/* Loader */}
          <CircularProgress sx={{ mt: 4 }} />
        </Box>

        {/* Animations */}
        <style>
          {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
        </style>
      </Box>
    </>
  );
};

export default WorkInProgress;
