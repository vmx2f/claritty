"use client";

import { useState } from "react";
import { BuildingOfficeIcon, CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useOrganization } from "../providers/organization-provider";
import Popover from "../layout/popover";

export default function OrganizationSelector() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const organizations = useQuery(api.organizations.getUserOrganizations);
    const { selectedOrgId, setSelectedOrgId } = useOrganization();
    const selectedOrg = organizations?.find((o) => o != null && o._id === selectedOrgId);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-sm">
                <Popover
                    mode="click"
                    position="bottom-center"
                    className="relative w-full"
                    onOpenChange={setIsDropdownOpen}
                    trigger={({ onClick }) => (
                        <button 
                            onClick={onClick}
                            className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-hover transition-colors text-left"
                        >
                            <div className="size-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-accent-color/10">
                                <BuildingOfficeIcon className="w-5 h-5 text-accent-color" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-primary-text truncate">
                                    {selectedOrg?.name || "Select Organization"}
                                </p>
                                <p className="text-xs text-secondary-text truncate">
                                    {selectedOrg?.userRole || "Choose an organization to continue"}
                                </p>
                            </div>
                            <ChevronDownIcon className={`w-4 h-4 text-secondary-text transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                    )}
                >
                    <div className="bg-card rounded-lg shadow-xl border border-border w-full max-h-60 overflow-y-auto">
                        {organizations && organizations.length > 0 ? (
                            organizations.filter((o): o is NonNullable<typeof o> => o != null).map((org) => (
                                <button
                                    key={org._id}
                                    onClick={() => {
                                        setSelectedOrgId(org._id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-hover transition-colors flex items-center justify-between ${
                                        selectedOrgId === org._id ? "bg-primary-text/10" : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {selectedOrgId === org._id && (
                                            <CheckIcon className="w-4 text-primary-text shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-primary-text truncate">{org.name}</p>
                                            <p className="text-xs text-secondary-text">{org.userRole}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-secondary-text">No organizations available</div>
                        )}
                    </div>
                </Popover>
            </div>
        </div>
    );
}
