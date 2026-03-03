import type { BlockConfig, BlockId } from "@/blocks/types";

type Registry = Record<BlockId, BlockConfig>;

type Resolution = {
  canActivate: boolean;
  requiredToEnable: BlockId[];
  optionalToEnable: BlockId[];
};

type DisableCheck = {
  canDisable: boolean;
  blockedBy: BlockId[];
};

type StateValidation = {
  valid: boolean;
  violations: string[];
};

export function resolve(
  blockId: BlockId,
  registry: Registry,
  activeBlocks: BlockId[]
): Resolution {
  const block = registry[blockId];
  const activeSet = new Set(activeBlocks);

  const requiredToEnable = block.hardDependencies.filter((dep) => !activeSet.has(dep));
  const optionalToEnable = block.softDependencies.filter((dep) => !activeSet.has(dep));

  return {
    canActivate: requiredToEnable.length === 0,
    requiredToEnable,
    optionalToEnable,
  };
}

export function canDisable(
  blockId: BlockId,
  registry: Registry,
  activeBlocks: BlockId[]
): DisableCheck {
  const activeSet = new Set(activeBlocks);
  const blockedBy = Object.values(registry)
    .filter((block) => activeSet.has(block.id))
    .filter((block) => block.hardDependencies.includes(blockId))
    .map((block) => block.id);

  return {
    canDisable: blockedBy.length === 0,
    blockedBy,
  };
}

export function getImpact(
  blockId: BlockId,
  registry: Registry,
  activeBlocks: BlockId[]
) {
  const activation = resolve(blockId, registry, activeBlocks);
  const disableResult = canDisable(blockId, registry, activeBlocks);
  const block = registry[blockId];

  const enableSummary = activation.canActivate
    ? `Enabling ${block.label} is available now.`
    : `Enabling ${block.label} also requires: ${activation.requiredToEnable
        .map((id) => registry[id].label)
        .join(", ")}.`;

  const softSummary = activation.optionalToEnable.length
    ? `${block.label} is enriched by: ${activation.optionalToEnable
        .map((id) => registry[id].label)
        .join(", ")}.`
    : `${block.label} has no additional soft dependency impact right now.`;

  const disableSummary = disableResult.canDisable
    ? `Disabling ${block.label} is safe. Data will be preserved.`
    : `Disabling ${block.label} would break: ${disableResult.blockedBy
        .map((id) => registry[id].label)
        .join(", ")}.`;

  return {
    enableSummary,
    softSummary,
    disableSummary,
  };
}

export function validateState(
  activeBlocks: BlockId[],
  registry: Registry
): StateValidation {
  const activeSet = new Set(activeBlocks);
  const violations: string[] = [];

  for (const block of Object.values(registry)) {
    if (!activeSet.has(block.id)) {
      continue;
    }

    for (const requiredId of block.hardDependencies) {
      if (!activeSet.has(requiredId)) {
        violations.push(`${block.id} requires ${requiredId}`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
