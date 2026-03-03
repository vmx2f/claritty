"use client";

import { useState } from "react";
import { useServiceLayer } from "@/hooks/useServiceLayer";

type UserSettingsFormProps = {
  onSuccess: (payload?: unknown) => void;
  onCancel: () => void;
};

export function UserSettingsForm({ onSuccess, onCancel }: UserSettingsFormProps) {
  const { settingsService } = useServiceLayer();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await settingsService.saveUserSettings({
      displayName,
      email,
      notifications,
      compactMode,
    });

    onSuccess({ ...result, passwordUpdated: password.length > 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="Display name"
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
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        type="password"
        placeholder="New password"
        className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm text-primary-text">
        <input
          type="checkbox"
          checked={notifications}
          onChange={(event) => setNotifications(event.target.checked)}
        />
        Enable notifications
      </label>
      <label className="flex items-center gap-2 text-sm text-primary-text">
        <input
          type="checkbox"
          checked={compactMode}
          onChange={(event) => setCompactMode(event.target.checked)}
        />
        Compact mode
      </label>
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
