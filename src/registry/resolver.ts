import type { ActionDefinition } from "@/registry/types";

function scoreAction(action: ActionDefinition, terms: string[]) {
  const keywordScore = terms.reduce((score, term) => {
    return score + action.keywords.filter((keyword) => keyword.includes(term)).length;
  }, 0);

  const label = action.label.toLowerCase();
  const description = action.description.toLowerCase();

  const directScore = terms.reduce((score, term) => {
    let next = score;
    if (label.includes(term)) next += 3;
    if (description.includes(term)) next += 1;
    return next;
  }, 0);

  return keywordScore + directScore + (action.usageWeight ?? 0);
}

export function resolveActions(query: string, actions: ActionDefinition[], limit = 6) {
  if (!query.trim()) {
    return [...actions]
      .sort((a, b) => (b.usageWeight ?? 0) - (a.usageWeight ?? 0))
      .slice(0, limit);
  }

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  const matched = actions
    .map((action) => ({ action, score: scoreAction(action, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.action);

  if (matched.length > 0) {
    return matched;
  }

  return [...actions]
    .sort((a, b) => (b.usageWeight ?? 0) - (a.usageWeight ?? 0))
    .slice(0, Math.min(4, actions.length));
}
