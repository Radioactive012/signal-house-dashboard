import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const destination = resolve(root, "public");
await mkdir(destination, { recursive: true });

function normalizeSupabaseUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) return "";
    return url.origin;
  } catch {
    return "";
  }
}

const supabaseUrl = normalizeSupabaseUrl(process.env.VITE_SUPABASE_URL);
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() || "";
const requireSupabaseConfig = process.env.REQUIRE_SUPABASE_CONFIG !== "false";

if (requireSupabaseConfig && (!supabaseUrl || !supabaseKey)) {
  throw new Error(
    "Missing Supabase browser configuration. Set VITE_SUPABASE_URL to the project origin (for example https://project.supabase.co) and VITE_SUPABASE_ANON_KEY before building."
  );
}

// Copy simple static files
for (const name of ["index.html", "styles.css", "roadmap-data.js"]) {
  await cp(resolve(root, name), resolve(destination, name));
}

// Process app.js
let appJs = await readFile(resolve(root, "app.js"), "utf8");
appJs = appJs.replace(/import\s+\{.*\}\s+from\s+['"]@supabase\/supabase-js['"];?/, "import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';");
appJs = appJs.replace(/import\.meta\.env\.VITE_SUPABASE_URL/g, JSON.stringify(supabaseUrl));
appJs = appJs.replace(/import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g, JSON.stringify(supabaseKey));
await writeFile(resolve(destination, "app.js"), appJs);
