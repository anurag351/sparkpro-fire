export interface AuditLog {
  id: number;
  entityType: string; // e.g. Employee, Request
  entityId: string;
  action: string; // CREATE, UPDATE, DELETE, APPROVE, REJECT
  performedBy: string; // employeeId
  comment?: string;
  timestamp: string;
}
