import React, { useEffect, useState } from "react";
import {
  Box,
  Collapse,
  Avatar,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { useToast } from "../utility/ToastProvider";

interface EmployeePhotoUploadProps {
  employeeId: string | number;
  existingPhotoFilename?: string | null;
  preview?: string | null;
  file?: File | null;
  onFileSelect: (file: File) => void;
  onUploadSuccess?: (filename: string) => void;
  onUploadFail?: (error: string) => void;
  onClear?: () => void;
  apiEndpoint: (id: string | number) => string;
  show?: boolean;
  setCheckUpload: React.Dispatch<React.SetStateAction<boolean>>;
}

const EmployeePhotoUpload: React.FC<EmployeePhotoUploadProps> = ({
  employeeId,
  existingPhotoFilename,
  preview: externalPreview,
  file,
  onFileSelect,
  onUploadSuccess,
  onUploadFail,
  onClear,
  apiEndpoint,
  setCheckUpload,
  show = true,
}) => {
  const toast = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    externalPreview || null
  );

  // 🔹 Update local preview whenever a new file or existing image is present
  useEffect(() => {
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      return () => URL.revokeObjectURL(localUrl);
    } else if (externalPreview) {
      setPreviewUrl(externalPreview);
    } else if (existingPhotoFilename) {
      setPreviewUrl(`${apiEndpoint(employeeId)}/${existingPhotoFilename}`);
    } else {
      setPreviewUrl(null);
    }
  }, [file, existingPhotoFilename, externalPreview, employeeId, apiEndpoint]);

  if (!show) return null;

  // 🔹 Upload handler
  const handleUpload = async () => {
    if (!file) {
      toast.info("Please select a picture");
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadRes = await fetch(apiEndpoint(employeeId), {
        method: "POST",
        body: uploadData,
      });
      if (!uploadRes.ok) throw new Error("File upload failed");

      const uploadJson = await uploadRes.json();

      onUploadSuccess?.(uploadJson.filename);
      setCheckUpload(true);
      toast.success("Photo uploaded successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      onUploadFail?.(message);
      toast.error(message);
    } finally {
      onClear?.();
    }
  };

  // 🔹 Remove preview and reset
  const handleRemove = () => {
    setPreviewUrl(null);
    onClear?.();
    toast.info("Photo preview removed");
  };

  return (
    <Box
      sx={{
        flex: { xs: 1, md: "0 0 30%" },
        width: { xs: "100%", md: "30%" },
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Collapse in={show}>
        <Box
          sx={{
            border: "1px dashed grey",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 🔹 Image preview */}
          <Avatar
            src={previewUrl || ""}
            alt="passport"
            sx={{
              width: 199,
              height: 246,
              mb: 2,
              bgcolor: previewUrl ? "transparent" : "grey.100",
              cursor: "pointer",
              border: previewUrl ? "1px solid #ddd" : "none",
              boxShadow: previewUrl ? 2 : 0,
            }}
            variant="rounded"
          />

          <Typography
            variant="caption"
            sx={{ mt: 2, color: "text.secondary", textAlign: "center" }}
          >
            {previewUrl ? "Preview of selected photo" : "No photo selected yet"}
          </Typography>

          {/* 🔹 File and control buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="outlined" component="label">
              {previewUrl ? "Change Photo" : "Choose File"}
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) onFileSelect(selected);
                }}
              />
            </Button>

            {previewUrl && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemove}
                sx={{ borderRadius: 2 }}
              >
                Remove
              </Button>
            )}
          </Stack>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, borderRadius: 2 }}
            disabled={!file}
            onClick={handleUpload}
          >
            Upload
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};

export default EmployeePhotoUpload;
