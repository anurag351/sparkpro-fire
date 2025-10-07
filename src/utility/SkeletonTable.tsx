// src/components/common/SkeletonTable.tsx
import React from "react";
import { Skeleton, Table, TableBody, TableCell, TableRow } from "@mui/material";

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  cols = 3,
}) => {
  return (
    <Table>
      <TableBody>
        {[...Array(rows)].map((_, rowIdx) => (
          <TableRow key={rowIdx}>
            {[...Array(cols)].map((_, colIdx) => (
              <TableCell key={colIdx}>
                <Skeleton variant="text" width={100 + colIdx * 20} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SkeletonTable;
