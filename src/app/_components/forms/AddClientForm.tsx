"use client";

import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type AddClientFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function AddClientForm({ onSuccess, onCancel }: AddClientFormProps) {
  const { selectedOrgId } = useOrganization();
  const { clientService } = useServiceLayer();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrgId || !name.trim() || !email.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await clientService.create({
        orgId: selectedOrgId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        status: "prospect",
      });
      onSuccess(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Client name"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
        required
      />
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        placeholder="Email"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
        required
      />
      <input
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Phone"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <input
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Address"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Notes"
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedOrgId}
          className="flex-1 rounded-lg bg-primary-text px-3 py-2 text-sm font-medium text-main disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Create"}
        </button>
      </div>
    </form>
  );
}
