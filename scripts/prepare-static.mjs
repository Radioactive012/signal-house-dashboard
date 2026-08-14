import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const destination = resolve(root, "public");
await mkdir(destination, { recursive: true });
for (const name of ["index.html", "styles.css", "roadmap-data.js", "app.js"]) {
  await cp(resolve(root, name), resolve(destination, name));
}
