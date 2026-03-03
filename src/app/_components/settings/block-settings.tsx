"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BLOCK_REGISTRY, MANDATORY_BLOCKS } from "@/blocks/registry";
import { canDisable, getImpact, resolve, validateState } from "@/blocks/dependency-engine";
import { normalizeOrganizationBlockState } from "@/blocks/runtime";
import type { BlockId } from "@/blocks/types";
import type { Id } from "../../../../convex/_generated/dataModel";

type BlockSettingsProps = {
  organizationId: Id<"organizations">;
  currentConfig: {
    active: string[];
    disabledAt: Record<string, number>;
    preset?: string;
  } | null | undefined;
  canManage: boolean;
};

export function BlockSettings({ organizationId, currentConfig, canManage }: BlockSettingsProps) {
  const updateBlockConfig = useMutation(api.organizations.updateOrganizationBlockConfig);
  const normalized = normalizeOrganizationBlockState(currentConfig ?? undefined);
  const [activeBlocks, setActiveBlocks] = useState<BlockId[]>(normalized.active);
  const [hoveredBlockId, setHoveredBlockId] = useState<BlockId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

  const blocks = useMemo(() => Object.values(BLOCK_REGISTRY), []);
  const selectedBlockId = hoveredBlockId ?? blocks[0]?.id ?? null;
  const selectedImpact = selectedBlockId
    ? getImpact(selectedBlockId, BLOCK_REGISTRY, activeBlocks)
    : null;

  const saveConfig = async (nextActive: BlockId[], nextDisabledAt: Record<string, number>) => {
    const validation = validateState(nextActive, BLOCK_REGISTRY);
    if (!validation.valid) {
      setMessage(`Invalid block state: ${validation.violations.join(", ")}`);
      return;
    }

    setIsSaving(true);
    try {
      await updateBlockConfig({
        organizationId,
        blockConfig: {
          active: nextActive,
          disabledAt: nextDisabledAt,
          preset: normalized.preset,
        },
      });
      setMessage("Block configuration updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update block configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBlock = async (blockId: BlockId) => {
    if (!canManage) {
      setMessage("Only owners can manage blocks.");
      return;
    }

    const isActive = activeBlocks.includes(blockId);
    const nextDisabledAt = { ...normalized.disabledAt };

    if (isActive) {
      if (MANDATORY_BLOCKS.includes(blockId)) {
        setMessage("This block is always active.");
        return;
      }

      const result = canDisable(blockId, BLOCK_REGISTRY, activeBlocks);
      if (!result.canDisable) {
        setMessage(
          `Cannot disable ${BLOCK_REGISTRY[blockId].label}. Required by: ${result.blockedBy
            .map((id) => BLOCK_REGISTRY[id].label)
            .join(", ")}.`
        );
        return;
      }

      const nextActive = activeBlocks.filter((id) => id !== blockId);
      nextDisabledAt[blockId] = Date.now();
      setActiveBlocks(nextActive);
      await saveConfig(nextActive, nextDisabledAt);
      return;
    }

    const resolution = resolve(blockId, BLOCK_REGISTRY, activeBlocks);
    const nextActive = Array.from(
      new Set<BlockId>([...activeBlocks, blockId, ...resolution.requiredToEnable])
    );

    setActiveBlocks(nextActive);
    await saveConfig(nextActive, nextDisabledAt);

    if (resolution.requiredToEnable.length > 0) {
      setMessage(
        `${BLOCK_REGISTRY[blockId].label} enabled with required blocks: ${resolution.requiredToEnable
          .map((id) => BLOCK_REGISTRY[id].label)
          .join(", ")}.`
      );
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2 rounded-xl border border-border bg-main p-4">
        <h3 className="text-sm font-semibold text-primary-text">Always Active</h3>
        {MANDATORY_BLOCKS.map((blockId) => (
          <div key={blockId} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium text-primary-text">{BLOCK_REGISTRY[blockId].label}</p>
              <p className="text-xs text-secondary-text">{BLOCK_REGISTRY[blockId].description}</p>
            </div>
            <span className="text-xs text-secondary-text">Required</span>
          </div>
        ))}

        <h3 className="pt-2 text-sm font-semibold text-primary-text">Core Blocks</h3>
        {blocks
          .filter((block) => block.tier !== "mandatory")
          .map((block) => {
            const isActive = activeBlocks.includes(block.id);
            return (
              <div
                key={block.id}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-primary-text">{block.label}</p>
                  <p className="text-xs text-secondary-text">{block.description}</p>
                </div>
                <button
                  type="button"
                  disabled={isSaving || block.tier === "future"}
                  onClick={() => toggleBlock(block.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    isActive ? "bg-primary-text text-main" : "border border-border text-secondary-text"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </button>
              </div>
            );
          })}
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-main p-4">
        <h3 className="text-sm font-semibold text-primary-text">Dependency Impact</h3>
        {selectedBlockId && selectedImpact ? (
          <>
            <p className="text-sm text-primary-text">{selectedImpact.enableSummary}</p>
            <p className="text-sm text-secondary-text">{selectedImpact.softSummary}</p>
            <p className="text-sm text-secondary-text">{selectedImpact.disableSummary}</p>
          </>
        ) : (
          <p className="text-sm text-secondary-text">Hover a block to inspect impact.</p>
        )}
        {message ? <p className="pt-2 text-xs text-secondary-text">{message}</p> : null}
      </div>
    </div>
  );
}
