"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface OrganizationContextType {
  selectedOrgId: Id<"organizations"> | null;
  setSelectedOrgId: (orgId: Id<"organizations"> | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [selectedOrgId, setSelectedOrgId] = useState<Id<"organizations"> | null>(null);

  return (
    <OrganizationContext.Provider value={{ selectedOrgId, setSelectedOrgId }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
