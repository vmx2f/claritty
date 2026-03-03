import type { NextRequest } from "next/server";
import { fetchAuthQuery } from "@/lib/auth-server";
import { normalizeOrganizationBlockState } from "@/blocks/runtime";
import type { BlockId } from "@/blocks/types";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type Scope = "view" | "create" | "edit" | "delete";

const BLOCK_TO_PERMISSION: Record<BlockId, string> = {
  chat: "reports",
  notifications: "notifications",
  settings: "settings",
  reports: "reports",
  products: "products",
  clients: "clients",
  orders: "orders",
  incomes: "transactions",
  outputs: "transactions",
  suppliers: "settings",
  employees: "settings",
};

export type RequestOrgContext = {
  id: Id<"organizations">;
  name: string;
  slug: string;
  activeBlocks: BlockId[];
  userRole: string;
  userPermissions: string[];
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function getOrgFromRequest(
  request: NextRequest,
  opts?: { requiredBlock?: BlockId; requiredScope?: Scope }
): Promise<{ org: RequestOrgContext | null; error: string | null }> {
  const organizations = await fetchAuthQuery(api.organizations.getUserOrganizations, {});

  if (!organizations || organizations.length === 0) {
    return { org: null, error: "Unauthorized" };
  }

  const orgIdParam = request.nextUrl.searchParams.get("orgId");
  const selected =
    (orgIdParam
      ? organizations.find((org) => org && org._id === (orgIdParam as Id<"organizations">))
      : organizations[0]) ?? organizations[0];

  if (!selected) {
    return { org: null, error: "Organization not found" };
  }

  const blockState = normalizeOrganizationBlockState(selected.blockConfig);

  const org: RequestOrgContext = {
    id: selected._id,
    name: selected.name,
    slug: slugify(selected.name),
    activeBlocks: blockState.active,
    userRole: selected.userRole,
    userPermissions: selected.userPermissions ?? [],
  };

  if (opts?.requiredBlock && !org.activeBlocks.includes(opts.requiredBlock)) {
    return { org: null, error: `Block ${opts.requiredBlock} is not active for this organization` };
  }

  const needsPermission = opts?.requiredBlock ? BLOCK_TO_PERMISSION[opts.requiredBlock] : null;
  if (opts?.requiredScope === "view" && needsPermission) {
    const canView = org.userRole === "owner" || org.userPermissions.includes(needsPermission);
    if (!canView) {
      return { org: null, error: "Insufficient permissions" };
    }
  }

  return { org, error: null };
}
