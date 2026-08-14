import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const destination = resolve(root, "public");
await mkdir(destination, { recursive: true });

// Copy simple static files
for (const name of ["index.html", "styles.css", "roadmap-data.js"]) {
  await cp(resolve(root, name), resolve(destination, name));
}

// Process app.js
let appJs = await readFile(resolve(root, "app.js"), "utf8");
appJs = appJs.replace(/import\s+\{.*\}\s+from\s+['"]@supabase\/supabase-js['"];?/, "import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';");
appJs = appJs.replace(/import\.meta\.env\.VITE_SUPABASE_URL/g, `"${process.env.VITE_SUPABASE_URL || ''}"`);
appJs = appJs.replace(/import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g, `"${process.env.VITE_SUPABASE_ANON_KEY || ''}"`);
await writeFile(resolve(destination, "app.js"), appJs);
