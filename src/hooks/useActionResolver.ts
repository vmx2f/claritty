"use client";

import { useMemo } from "react";
import { isActionAllowedForBlocks } from "@/blocks/runtime";
import type { BlockId } from "@/blocks/types";
import { actionRegistry } from "@/registry/actionRegistry";
import { resolveActions } from "@/registry/resolver";

export function useActionResolver(query: string, limit = 6, activeBlocks?: BlockId[]) {
  return useMemo(() => {
    const scopedActions = activeBlocks?.length
      ? actionRegistry.filter((action) => isActionAllowedForBlocks(action.blockId, activeBlocks))
      : actionRegistry;

    return resolveActions(query, scopedActions, limit);
  }, [query, limit, activeBlocks]);
}
