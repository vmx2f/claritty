"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useOrganization } from "@/app/_components/providers/organization-provider";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type OrgSettingsFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function OrgSettingsForm({ onSuccess, onCancel }: OrgSettingsFormProps) {
  const { selectedOrgId } = useOrganization();
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const { settingsService } = useServiceLayer();
  const currentOrg = organizations?.find((org) => org?._id === selectedOrgId);

  const [name, setName] = useState(currentOrg?.name ?? "");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("PEN");
  const [taxRate, setTaxRate] = useState("18");
  const [theme, setTheme] = useState("system");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrgId) {
      return;
    }

    await settingsService.saveOrgSettings({
      organizationId: selectedOrgId,
      name,
      description: `Address: ${address}; Currency: ${currency}; Tax: ${taxRate}; Theme: ${theme}`,
    });

    onSuccess({ name, address, currency, taxRate, theme });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Business name"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <input
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Address"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          placeholder="Currency"
          className="rounded-lg border border-border bg-main px-3 py-2 text-sm"
        />
        <input
          value={taxRate}
          onChange={(event) => setTaxRate(event.target.value)}
          placeholder="Tax rate"
          className="rounded-lg border border-border bg-main px-3 py-2 text-sm"
        />
      </div>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
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
