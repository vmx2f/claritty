"use client";

import { useState } from "react";
import { UserSettingsForm } from "@/app/_components/forms/UserSettingsForm";

export default function UserSettingsPage() {
  const [status, setStatus] = useState<string>("");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-primary-text tracking-tight">User Settings</h1>
        <p className="mt-1 text-secondary-text">Manage your profile and personal preferences.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <UserSettingsForm
          onCancel={() => setStatus("No changes were saved.")}
          onSuccess={() => setStatus("Settings updated.")}
        />
      </div>

      {status ? <p className="text-sm text-secondary-text">{status}</p> : null}
    </div>
  );
}
