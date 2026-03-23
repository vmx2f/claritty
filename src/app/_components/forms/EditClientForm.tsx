"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useOrganization } from "@/app/_components/providers/organization-provider";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type EditClientFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function EditClientForm({ onSuccess, onCancel }: EditClientFormProps) {
  const { selectedOrgId } = useOrganization();
  const clients = useQuery(api.clients.getClients, selectedOrgId ? { orgId: selectedOrgId } : "skip");
  const { clientService } = useServiceLayer();

  const [clientId, setClientId] = useState<Id<"clients"> | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "prospect">("prospect");

  const selectedClient = useMemo(
    () => clients?.find((client) => client._id === clientId),
    [clients, clientId]
  );

  const hydrateFromSelected = (nextClientId: Id<"clients">) => {
    const found = clients?.find((client) => client._id === nextClientId);
    if (!found) return;
    setName(found.name);
    setEmail(found.email);
    setPhone(found.phone ?? "");
    setStatus(found.status);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clientId || !selectedOrgId) {
      return;
    }

    await clientService.update(clientId, {
      name: name.trim() || selectedClient?.name || "",
      email: email.trim() || selectedClient?.email || "",
      phone: phone.trim() || undefined,
      status,
    });
    onSuccess({ clientId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={clientId}
        onChange={(event) => {
          const next = event.target.value as Id<"clients">;
          setClientId(next);
          hydrateFromSelected(next);
        }}
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
        required
      >
        <option value="">Select client</option>
        {clients?.map((client) => (
          <option key={client._id} value={client._id}>
            {client.name}
          </option>
        ))}
      </select>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Name"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        placeholder="Email"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <input
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Phone"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as "active" | "inactive" | "prospect")}
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      >
        <option value="prospect">Prospect</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
          Cancel
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-primary-text px-3 py-2 text-sm font-medium text-main">
          Save
        </button>
      </div>
    </form>
  );
}
