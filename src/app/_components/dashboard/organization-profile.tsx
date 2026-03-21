"use client";

import { useState, useEffect } from "react";
import { BuildingOfficeIcon, CheckIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useOrganization } from "../../../contexts/OrganizationContext";
import { normalizeOrganizationBlockState } from "@/blocks/runtime";
import { useExtracted } from "next-intl";
import Popover from "../layout/popover";
import Modal from "../layout/modal";

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function OrganizationProfile({ isCollapsed, onToggle }: SidebarProps) {
    const t = useExtracted('organization');

    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
    const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [newOrgDescription, setNewOrgDescription] = useState("");

    // Organization management & notifications
    const organizations = useQuery(api.organizations.getUserOrganizations);
    const createOrgMutation = useMutation(api.organizations.createOrganization);
    const { selectedOrgId, setSelectedOrgId, setActiveBlocks } = useOrganization();
    const selectedOrg = organizations?.find((o) => o != null && o._id === selectedOrgId);
    const orgImageStorageId = selectedOrg?.imageStorageId ?? null;
    const orgImageUrl = useQuery(
        api.organizations.getFileUrl,
        orgImageStorageId ? { storageId: orgImageStorageId } : "skip"
    );

    useEffect(() => {
        const first = organizations?.[0];
        if (first && !selectedOrgId) {
            setSelectedOrgId(first._id);
        }
    }, [organizations, selectedOrgId, setSelectedOrgId]);

    useEffect(() => {
        if (!organizations || !selectedOrgId) {
            return;
        }

        const currentOrg = organizations.find((org) => org != null && org._id === selectedOrgId);
        const normalized = normalizeOrganizationBlockState(currentOrg?.blockConfig);
        setActiveBlocks(normalized.active);
    }, [organizations, selectedOrgId, setActiveBlocks]);

    const createOrganization = async () => {
        if (!newOrgName.trim()) return;

        try {
            await createOrgMutation({
                name: newOrgName.trim(),
                description: newOrgDescription.trim() || undefined
            });
            setNewOrgName("");
            setNewOrgDescription("");
            setShowCreateOrgModal(false);
        } catch (error) {
            console.error("Failed to create organization:", error);
        }
    };

    return (
        <div className="flex flex-col w-full">
            <Popover
                mode="click"
                position="left-bottom"
                className="relative"
                onOpenChange={setIsOrgDropdownOpen}
                trigger={({ onClick }) => (
                    <button onClick={onClick}
                        className="flex w-full items-center gap-2 p-2 hover:bg-hover text-left bg-main/10 py-4 border-b border-border">
                        <div className="size-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {orgImageUrl ? (
                                <img src={orgImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <BuildingOfficeIcon className="w-3.5 h-3.5 text-primary-text" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-primary-text truncate">
                                {selectedOrg?.name || "Select Org"}
                            </p>
                            <p className="text-[0.7rem] text-secondary-text truncate">
                                {selectedOrg?.userRole || ""}
                            </p>
                        </div>
                        <ChevronDownIcon className={`w-3.5 h-3.5 mr-4 text-secondary-text transition-transform truncate ${isOrgDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                )}>

                <div className="absolute bg-card rounded-lg shadow-xl border border-border w-full">
                    <div className="overflow-y-auto">
                        {organizations && organizations.length > 0 ? (
                            organizations.filter((o): o is NonNullable<typeof o> => o != null).map((org) => (
                                <button
                                    key={org._id}
                                    onClick={() => {
                                        setSelectedOrgId(org._id);
                                        setIsOrgDropdownOpen(false);
                                    }}
                                    className={`w-full rounded-none text-left px-2 py-2 text-sm hover:bg-primary-text/10 transition-colors flex items-center justify-between ${selectedOrgId === org._id ? "bg-primary-text/10" : "bg-main/10"
                                        }`}
                                >
                                    <div className="flex gap-1">
                                        {selectedOrgId === org._id && <CheckIcon className="w-3 text-primary-text shrink-0" />}
                                        <p className="text-xs font-medium text-primary-text truncate">{org.name}</p>
                                    </div>
                                    <p className="text-[10px] text-secondary-text">{org.userRole}</p>

                                </button>
                            ))
                        ) : (
                            <div className="p-3 text-xs text-secondary-text">{t('No organizations')}</div>
                        )}
                    </div>
                    <div className="border-t border-border">
                        <button
                            onClick={() => {
                                setShowCreateOrgModal(true);
                                setIsOrgDropdownOpen(false);
                            }}
                            className="w-full rounded-none text-left px-3 py-2 text-xs font-medium bg-main/10 text-primary-text transition-colors flex items-center gap-1 hover:bg-primary-text/10"
                        >
                            <PlusIcon className="w-4 h-4" />
                            {t('New Organization')}
                        </button>
                    </div>
                </div>
            </Popover>
            <Modal
                isOpen={showCreateOrgModal}
                onClose={() => setShowCreateOrgModal(false)}
                title="Create Organization"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-primary-text mb-1">Name *</label>
                        <input
                            type="text"
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            placeholder="Enter organization name"
                            className="w-full bg-main border border-border rounded-lg px-3 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-primary-text mb-1">Description</label>
                        <textarea
                            value={newOrgDescription}
                            onChange={(e) => setNewOrgDescription(e.target.value)}
                            placeholder="Optional description"
                            rows={3}
                            className="w-full bg-main border border-border rounded-lg px-3 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent-color/50 resize-none"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setShowCreateOrgModal(false)}
                            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-hover transition-colors text-sm text-primary-text"
                        >
                            {t('Cancel')}
                        </button>
                        <button
                            onClick={createOrganization}
                            disabled={!newOrgName.trim()}
                            className="flex-1 px-4 py-2 bg-primary-text text-white rounded-lg hover:bg-text-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('Create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>

    );
}
