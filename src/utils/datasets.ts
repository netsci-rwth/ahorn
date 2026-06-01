export type DatasetFrontmatter = {
  title?: string;
  disable?: boolean;
  source?: string;
  license?: unknown;
  citation?: unknown;
  parent?: string;
  related?: string[];
  tags?: string[];
  "network-type"?: string[];
  attachments?: unknown;
  statistics?: Record<string, unknown>;
};

export function getParentSlug(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function getBuildScriptSlug(slug: string, parent: unknown): string {
  return getParentSlug(parent) ?? slug;
}
