export interface Employee {
  id: string;
  name: string;
  role: "EMPLOYEE" | "MANAGER" | "APD" | "PD" | "MD" | "CLIENT" | "ADMIN";
  managerId?: string;
  contact: string;
  isActive: boolean;
}
