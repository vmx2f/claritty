"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useOrganization } from "../../../../../contexts/OrganizationContext";
import { Id } from "../../../../../../convex/_generated/dataModel";
import {
  BuildingOfficeIcon,
  UsersIcon,
  Cog6ToothIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const AREAS = [
  { id: "reports", name: "Reports" },
  { id: "orders", name: "Orders" },
  { id: "transactions", name: "Ingresos y Salidas" },
  { id: "products", name: "Products" },
  { id: "clients", name: "Clients" },
  { id: "flowchart", name: "Flow Chart" },
  { id: "notifications", name: "Notifications" },
  { id: "settings", name: "Settings" },
];

type Tab = "organization" | "members";

export default function SettingsPage() {
  const { selectedOrgId } = useOrganization();
  const [tab, setTab] = useState<Tab>("organization");

  if (!selectedOrgId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <Cog6ToothIcon className="w-16 h-16 text-secondary-text mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-primary-text mb-2">
            No Organization Selected
          </h3>
          <p className="text-secondary-text">Select an organization to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-primary-text tracking-tight">
          Settings
        </h1>
        <p className="text-secondary-text mt-1">
          Manage your organization and team
        </p>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setTab("organization")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === "organization"
              ? "bg-primary-text text-white"
              : "text-secondary-text hover:bg-hover"
          }`}
        >
          <BuildingOfficeIcon className="w-5 h-5" />
          Organization
        </button>
        <button
          onClick={() => setTab("members")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === "members"
              ? "bg-primary-text text-white"
              : "text-secondary-text hover:bg-hover"
          }`}
        >
          <UsersIcon className="w-5 h-5" />
          Members & Groups
        </button>
      </div>

      {tab === "organization" && (
        <OrganizationSection selectedOrgId={selectedOrgId} />
      )}
      {tab === "members" && <MembersSection selectedOrgId={selectedOrgId} />}
    </div>
  );
}

function OrganizationSection({ selectedOrgId }: { selectedOrgId: Id<"organizations"> }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [synced, setSynced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const organizations = useQuery(api.organizations.getUserOrganizations);
  const orgImageUrl = useQuery(
    api.organizations.getFileUrl,
    selectedOrgId && organizations
      ? {
          storageId:
            organizations.find((o) => o._id === selectedOrgId)?.imageStorageId ??
            null,
        }
      : "skip"
  );
  const updateOrg = useMutation(api.organizations.updateOrganization);
  const generateUploadUrl = useMutation(api.organizations.generateUploadUrl);

  const org = organizations?.find((o) => o._id === selectedOrgId);
  if (org && !synced) {
    setName(org.name);
    setDescription(org.description ?? "");
    setSynced(true);
  }

  const handleSave = async () => {
    try {
      await updateOrg({
        organizationId: selectedOrgId,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrgId) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen (PNG, JPG, etc.)");
      return;
    }
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      await updateOrg({ organizationId: selectedOrgId, imageStorageId: storageId });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-shrink-0">
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl bg-main border border-border overflow-hidden flex items-center justify-center">
              {orgImageUrl ? (
                <img src={orgImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <BuildingOfficeIcon className="w-16 h-16 text-secondary-text" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl"
            >
              {uploading ? (
                <span className="text-sm text-white">Subiendo...</span>
              ) : (
                <PhotoIcon className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-secondary-text mt-2 text-center">Clic para cambiar imagen</p>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsEditing(true)}
              className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary-text/30"
              placeholder="Nombre de la organización"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsEditing(true)}
              rows={3}
              className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text resize-none focus:outline-none focus:ring-2 focus:ring-primary-text/30"
              placeholder="Descripción opcional"
            />
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-text text-white rounded-lg hover:bg-primary-text/90 font-medium"
              >
                <CheckIcon className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={() => {
                  setName(org?.name ?? "");
                  setDescription(org?.description ?? "");
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-hover text-primary-text"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MembersSection({ selectedOrgId }: { selectedOrgId: Id<"organizations"> }) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<Id<"roleGroups"> | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["reports"]);
  const [inviteGroupId, setInviteGroupId] = useState<Id<"roleGroups"> | "">("");
  const [groupName, setGroupName] = useState("");
  const [groupPermissions, setGroupPermissions] = useState<string[]>(["reports"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const members = useQuery(api.members.getOrganizationMembers, { organizationId: selectedOrgId });
  const invitations = useQuery(api.members.getOrganizationInvitations, { organizationId: selectedOrgId });
  const roleGroups = useQuery(api.roleGroups.getRoleGroups, { organizationId: selectedOrgId });

  const createInvitation = useMutation(api.members.createInvitation);
  const revokeInvitation = useMutation(api.members.revokeInvitation);
  const removeMember = useMutation(api.members.removeMember);
  const updateMemberPermissions = useMutation(api.members.updateMemberPermissions);
  const createRoleGroup = useMutation(api.roleGroups.createRoleGroup);
  const updateRoleGroup = useMutation(api.roleGroups.updateRoleGroup);
  const deleteRoleGroup = useMutation(api.roleGroups.deleteRoleGroup);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsSubmitting(true);
    try {
      await createInvitation({
        organizationId: selectedOrgId,
        email: inviteEmail.trim(),
        role: inviteRole,
        permissions: inviteGroupId
          ? (roleGroups?.find((g) => g._id === inviteGroupId)?.permissions ?? selectedPermissions)
          : selectedPermissions,
      });
      setInviteEmail("");
      setIsInviteModalOpen(false);
      setInviteGroupId("");
      setSelectedPermissions(["reports"]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePermission = (id: string) => {
    setGroupPermissions((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };

  const openCreateGroup = () => {
    setEditingGroupId(null);
    setGroupName("");
    setGroupPermissions(["reports"]);
    setIsGroupModalOpen(true);
  };

  const openEditGroup = (g: { _id: Id<"roleGroups">; name: string; permissions: string[] }) => {
    setEditingGroupId(g._id);
    setGroupName(g.name);
    setGroupPermissions(g.permissions);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) return;
    try {
      if (editingGroupId) {
        await updateRoleGroup({ groupId: editingGroupId, name: groupName, permissions: groupPermissions });
      } else {
        await createRoleGroup({
          organizationId: selectedOrgId,
          name: groupName,
          permissions: groupPermissions,
        });
      }
      setIsGroupModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const assignToGroup = async (memberId: Id<"organizationMembers">, groupId: Id<"roleGroups"> | "") => {
    try {
      await updateMemberPermissions({
        organizationId: selectedOrgId,
        memberId,
        roleGroupId: groupId || undefined,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary-text">Role Groups</h2>
        <button
          onClick={openCreateGroup}
          className="flex items-center gap-2 px-4 py-2 bg-primary-text text-white rounded-lg hover:bg-primary-text/90 font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          New Group
        </button>
      </div>

      {roleGroups && roleGroups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleGroups.map((group) => (
            <div
              key={group._id}
              className="bg-card border border-border rounded-xl p-4 flex justify-between items-start"
            >
              <div>
                <h3 className="font-medium text-primary-text">{group.name}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {group.permissions.map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-main px-1.5 py-0.5 rounded text-secondary-text"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditGroup(group)}
                  className="p-1.5 hover:bg-hover rounded-lg text-secondary-text hover:text-primary-text"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Delete this group? Members will be unassigned.")) {
                      await deleteRoleGroup({ groupId: group._id });
                    }
                  }}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-secondary-text hover:text-red-500"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary-text">Members</h2>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-text text-white rounded-lg hover:bg-primary-text/90 font-medium"
        >
          <UserPlusIcon className="w-5 h-5" />
          Invite
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-main/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium text-primary-text">User</th>
              <th className="px-6 py-3 font-medium text-primary-text">Role</th>
              <th className="px-6 py-3 font-medium text-primary-text">Group</th>
              <th className="px-6 py-3 font-medium text-primary-text text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members?.map((member) => (
              <tr key={member._id} className="hover:bg-hover">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-text/10 flex items-center justify-center text-primary-text font-medium text-sm">
                      {member.userId.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-primary-text text-sm">{member.userId}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-main capitalize">
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <select
                    value={member.roleGroupId ?? ""}
                    onChange={(e) =>
                      assignToGroup(
                        member._id,
                        (e.target.value as Id<"roleGroups">) || ""
                      )
                    }
                    disabled={member.role === "owner"}
                    className="bg-main border border-border rounded-lg px-3 py-1.5 text-sm text-primary-text"
                  >
                    <option value="">—</option>
                    {roleGroups?.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-3 text-right">
                  {member.role !== "owner" && (
                    <button
                      onClick={async () => {
                        if (confirm("Remove this member?")) {
                          await removeMember({ organizationId: selectedOrgId, memberId: member._id });
                        }
                      }}
                      className="p-1.5 text-secondary-text hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invitations && invitations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-primary-text mb-3">Pending Invitations</h2>
          <div className="flex flex-wrap gap-2">
            {invitations.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center gap-2 bg-main rounded-lg px-3 py-2 border border-border"
              >
                <EnvelopeIcon className="w-4 h-4 text-secondary-text" />
                <span className="text-sm text-primary-text">{inv.email}</span>
                <span className="text-xs text-secondary-text">({inv.role})</span>
                <button
                  onClick={() => revokeInvitation({ invitationId: inv._id })}
                  className="p-1 hover:bg-red-500/10 rounded text-secondary-text hover:text-red-500"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-text">Invite Member</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-hover rounded-lg">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">Assign to Group (optional)</label>
                <select
                  value={inviteGroupId}
                  onChange={(e) => setInviteGroupId(e.target.value as Id<"roleGroups"> | "")}
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                >
                  <option value="">Custom permissions</option>
                  {roleGroups?.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              {!inviteGroupId && (
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AREAS.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(a.id)}
                          onChange={() => {
                            setSelectedPermissions((p) =>
                              p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id]
                            );
                          }}
                        />
                        <span className="text-sm text-primary-text">{a.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-hover text-primary-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-text text-white rounded-lg hover:bg-primary-text/90 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" /> : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-text">
                {editingGroupId ? "Edit Group" : "New Group"}
              </h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-2 hover:bg-hover rounded-lg">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">Group Name</label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-main border border-border rounded-lg px-4 py-2 text-primary-text"
                  placeholder="e.g. Sales Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {AREAS.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={groupPermissions.includes(a.id)}
                        onChange={() => handleTogglePermission(a.id)}
                      />
                      <span className="text-sm text-primary-text">{a.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsGroupModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-hover text-primary-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGroup}
                  disabled={!groupName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-text text-white rounded-lg hover:bg-primary-text/90 font-medium disabled:opacity-50"
                >
                  {editingGroupId ? "Save" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
