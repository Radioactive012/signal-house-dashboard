import { access, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

async function exists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

export function sites(): Plugin {
  let root = process.cwd();
  return {
    name: "sites",
    apply: "build",
    configResolved(config) { root = config.root; },
    async closeBundle() {
      const target = resolve(root, "dist", ".openai");
      const source = resolve(root, ".openai", "hosting.json");
      await rm(target, { recursive: true, force: true });
      await mkdir(target, { recursive: true });
      if (await exists(source)) await cp(source, resolve(target, "hosting.json"));
    },
  };
}
