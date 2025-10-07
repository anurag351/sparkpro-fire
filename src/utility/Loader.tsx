// src/components/common/Loader.tsx
import React from "react";
import { CircularProgress, Backdrop, Box } from "@mui/material";

interface LoaderProps {
  fullScreen?: boolean;
  size?: number;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false, size = 40 }) => {
  if (fullScreen) {
    return (
      <Backdrop
        open
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress size={size} color="inherit" />
      </Backdrop>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default Loader;
