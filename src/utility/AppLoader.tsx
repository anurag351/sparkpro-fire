// src/components/common/AppLoader.tsx
import React from "react";
import Loader from "./Loader";
import SkeletonTable from "./SkeletonTable";

interface AppLoaderProps {
  type?: "spinner" | "skeleton";
  rows?: number;
  cols?: number;
  fullScreen?: boolean;
}

const AppLoader: React.FC<AppLoaderProps> = ({
  type = "spinner",
  rows,
  cols,
  fullScreen,
}) => {
  if (type === "skeleton") return <SkeletonTable rows={rows} cols={cols} />;
  return <Loader fullScreen={fullScreen} />;
};

export default AppLoader;
