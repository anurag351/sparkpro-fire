import React, { createContext, useContext, useState, ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  role: "EMPLOYEE" | "MANAGER" | "APD" | "PD" | "MD" | null;
  login: (token: string, role: AuthContextType["role"]) => void;
  logout: () => void;
};

// Default value (empty)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<AuthContextType["role"]>(null);

  const login = (newToken: string, newRole: AuthContextType["role"]) => {
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy usage
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
