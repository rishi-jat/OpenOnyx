/**
 * CSS snippet helpers (parse appearance.json, safe filenames).
 * Runtime lives in snippetManager.ts.
 */

export type CssSnippetSource = "openonyx" | "obsidian";

export interface CssSnippet {
  name: string;
  fileName: string;
  path: string;
  source: CssSnippetSource;
  enabled: boolean;
}

export interface AppearanceFile {
  enabledCssSnippets?: string[];
  [key: string]: unknown;
}

export function safeCssFileName(fileName: string): string | null {
  const base = fileName.replace(/\\/g, "/").split("/").pop() || "";
  if (!base || base.startsWith(".") || base.includes("\0")) return null;
  if (!base.toLowerCase().endsWith(".css")) return null;
  const stem = base.slice(0, -4);
  if (!stem || stem === "." || stem === "..") return null;
  return base;
}

/** Tokens snippets are allowed to override. Do not copy these onto body inline. */
export const SNIPPET_OWNED_CSS_VARS = [
  "--h1-color",
  "--h2-color",
  "--h3-color",
  "--h4-color",
  "--h5-color",
  "--h6-color",
  "--h1-size",
  "--h2-size",
  "--h3-size",
  "--h4-size",
  "--h5-size",
  "--h6-size",
  "--h1-weight",
  "--h2-weight",
  "--h3-weight",
  "--h4-weight",
  "--h5-weight",
  "--h6-weight",
  "--h1-line-height",
  "--h2-line-height",
  "--h3-line-height",
  "--h4-line-height",
  "--h5-line-height",
  "--h6-line-height",
  "--file-line-width",
  "--font-text-size",
  "--font-text",
  "--inline-title-color",
  "--inline-title-size",
] as const;

export function snippetNameFromFile(fileName: string): string | null {
  const base = safeCssFileName(fileName);
  if (!base) return null;
  return base.slice(0, -4);
}

export function parseEnabledCssSnippets(raw: string | null | undefined): string[] | null {
  if (!raw || !String(raw).trim()) return null;
  try {
    const parsed = JSON.parse(raw) as AppearanceFile;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.enabledCssSnippets)) return [];
    return parsed.enabledCssSnippets.filter((name): name is string =>
      typeof name === "string" && name.trim().length > 0 && !name.includes("/") && !name.includes("\\"),
    );
  } catch {
    return null;
  }
}

export function mergeAppearanceEnabled(existingRaw: string | null | undefined, enabled: string[]): string {
  let existing: AppearanceFile = {};
  if (existingRaw && existingRaw.trim()) {
    try {
      const parsed = JSON.parse(existingRaw) as AppearanceFile;
      if (parsed && typeof parsed === "object") existing = parsed;
    } catch {
      existing = {};
    }
  }
  return JSON.stringify(
    {
      ...existing,
      enabledCssSnippets: [...enabled].sort((a, b) => a.localeCompare(b)),
    },
    null,
    2,
  );
}

export {
  cssSnippetsApi,
  getCssSnippetNames,
  getCssSnippets,
  getEnabledCssSnippetSet,
  getSnippetManager,
  isObsidianSnippetPath,
  isOpenOnyxSnippetPath,
  isSnippetPath,
  openCssSnippetsFolder,
  peekSnippetManager,
  refreshCssSnippets,
  resetCssSnippetsForTests,
  setCssSnippetEnabled,
  startCssSnippets,
  stopCssSnippets,
  subscribeCssSnippets,
} from "./snippetManager";
