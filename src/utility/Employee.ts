export interface Employee {
  id: string;
  name: string;
  role: "EMPLOYEE" | "MANAGER" | "APD" | "PD" | "MD" | "CLIENT" | "ADMIN";
  contact: string;
  manager_id: string;
  salary_per_month: 20000.0;
  overtime_charge_per_hour: null;
  deduct_per_hour: null;
  deduct_per_day: null;
  aadhaar_number: string;
  passport_photo_filename: string;
  serial_no: number;
  is_active: boolean;
}
