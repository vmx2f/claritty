import { BLOCK_REGISTRY, MANDATORY_BLOCKS } from "@/blocks/registry";
import { DEFAULT_BLOCK_PRESET, getPresetBlocks } from "@/blocks/presets";
import type { BlockId, BlockPresetId, OrganizationBlockState } from "@/blocks/types";

const NAV_KEY_TO_BLOCKS: Record<string, BlockId[]> = {
  chat: ["chat"],
  notifications: ["notifications"],
  settings: ["settings"],
  reports: ["reports"],
  products: ["products"],
  clients: ["clients"],
  orders: ["orders"],
  transactions: ["incomes", "outputs"],
  flowChart: ["reports"],
};

function ensureMandatory(blocks: BlockId[]) {
  return Array.from(new Set([...blocks, ...MANDATORY_BLOCKS]));
}

export function defaultOrganizationBlockState(preset: BlockPresetId = DEFAULT_BLOCK_PRESET): OrganizationBlockState {
  return {
    active: ensureMandatory(getPresetBlocks(preset)),
    disabledAt: {},
    preset,
  };
}

export function normalizeOrganizationBlockState(
  input?:
    | Partial<OrganizationBlockState>
    | {
        active?: string[];
        disabledAt?: Record<string, number>;
        preset?: string;
      }
    | null
) {
  if (!input || !Array.isArray(input.active)) {
    return defaultOrganizationBlockState();
  }

  const registryIds = new Set<BlockId>(Object.keys(BLOCK_REGISTRY) as BlockId[]);
  const preset = input.preset;
  const normalizedPreset: BlockPresetId =
    preset === "lean" || preset === "standard" || preset === "commerce" || preset === "services"
      ? preset
      : DEFAULT_BLOCK_PRESET;
  const active = ensureMandatory(
    input.active
      .map((id) => id as BlockId)
      .filter((id) => registryIds.has(id))
  );

  return {
    active,
    disabledAt: input.disabledAt ?? {},
    preset: normalizedPreset,
  } satisfies OrganizationBlockState;
}

export function isNavItemActive(navKey: string, activeBlocks: BlockId[]) {
  const requiredBlocks = NAV_KEY_TO_BLOCKS[navKey] ?? [];
  if (requiredBlocks.length === 0) {
    return true;
  }

  return requiredBlocks.some((blockId) => activeBlocks.includes(blockId));
}

export function isActionAllowedForBlocks(actionBlockId: BlockId, activeBlocks: BlockId[]) {
  return activeBlocks.includes(actionBlockId);
}
