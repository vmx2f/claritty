"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Id } from "@/../convex/_generated/dataModel";
import { defaultOrganizationBlockState } from "@/blocks/runtime";
import type { BlockId } from "@/blocks/types";

interface OrganizationContextType {
  selectedOrgId: Id<"organizations"> | null;
  setSelectedOrgId: (orgId: Id<"organizations"> | null) => void;
  activeBlocks: BlockId[];
  setActiveBlocks: (blocks: BlockId[]) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [selectedOrgId, setSelectedOrgId] = useState<Id<"organizations"> | null>(null);
  const [activeBlocks, setActiveBlocks] = useState<BlockId[]>(defaultOrganizationBlockState().active);

  return (
    <OrganizationContext.Provider value={{ selectedOrgId, setSelectedOrgId, activeBlocks, setActiveBlocks }}>
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
