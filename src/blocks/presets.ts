import { MANDATORY_BLOCKS } from "@/blocks/registry";
import type { BlockId, BlockPresetId } from "@/blocks/types";

const dedupe = (blocks: BlockId[]): BlockId[] => Array.from(new Set(blocks));

export const BLOCK_PRESETS: Record<BlockPresetId, BlockId[]> = {
  lean: dedupe([...MANDATORY_BLOCKS, "products", "clients", "incomes"]),
  standard: dedupe([...MANDATORY_BLOCKS, "reports", "products", "clients", "orders", "incomes", "outputs"]),
  commerce: dedupe([...MANDATORY_BLOCKS, "reports", "products", "clients", "orders", "incomes", "outputs"]),
  services: dedupe([...MANDATORY_BLOCKS, "reports", "clients", "incomes", "outputs"]),
};

export const DEFAULT_BLOCK_PRESET: BlockPresetId = "standard";

export function getPresetBlocks(preset?: BlockPresetId) {
  return BLOCK_PRESETS[preset ?? DEFAULT_BLOCK_PRESET];
}
