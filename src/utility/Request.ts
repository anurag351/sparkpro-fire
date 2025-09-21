export type RequestType = "LEAVE" | "ATTENDANCE" | "PROJECT" | "GENERAL";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "REASSIGNED";

export interface Request {
  id: string;
  type: RequestType;
  assignedTo: string; // employeeId of approver
  createdBy: string;
  status: RequestStatus;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
