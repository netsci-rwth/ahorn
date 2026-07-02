export type TagSemanticGroup =
  "domain" | "network-type" | "source" | "metadata" | "lifting" | "other";

export const TAG_GROUP_ORDER: TagSemanticGroup[] = [
  "domain",
  "network-type",
  "source",
  "metadata",
  "lifting",
  "other",
];

export const TAG_GROUP_TITLES: Record<TagSemanticGroup, string> = {
  domain: "Data domain",
  "network-type": "Network type",
  source: "Source",
  metadata: "Metadata",
  lifting: "Graph Lifting",
  other: "Other",
};

export function getTagDisplayLabel(tag: string): string {
  const parts = tag.split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : tag;
}

export function getTagSemanticGroup(tag: string): TagSemanticGroup {
  const prefix = tag.split(":", 1)[0]?.trim().toLowerCase() ?? "";
  if (TAG_GROUP_ORDER.includes(prefix as TagSemanticGroup)) {
    return prefix as TagSemanticGroup;
  }

  return "other";
}

export function compareTagsBySemanticGroup(a: string, b: string): number {
  const aGroup = getTagSemanticGroup(a);
  const bGroup = getTagSemanticGroup(b);
  const groupComparison =
    TAG_GROUP_ORDER.indexOf(aGroup) - TAG_GROUP_ORDER.indexOf(bGroup);

  if (groupComparison !== 0) {
    return groupComparison;
  }

  return getTagDisplayLabel(a).localeCompare(getTagDisplayLabel(b));
}

export function groupByTagSemanticGroup<T>(
  items: T[],
  getTag: (item: T) => string,
): Array<{
  key: TagSemanticGroup;
  title: string;
  items: T[];
}> {
  const groups = new Map<TagSemanticGroup, T[]>();

  for (const item of items) {
    const key = getTagSemanticGroup(getTag(item));
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return TAG_GROUP_ORDER.filter((key) => groups.has(key))
    .map((key) => ({
      key,
      title: TAG_GROUP_TITLES[key],
      items: groups.get(key) ?? [],
    }))
    .filter(({ items }) => items.length > 0);
}
