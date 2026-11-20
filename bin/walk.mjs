// Shared by both CLIs: collect source files under the given directories.
import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const SKIPPED = new Set(["node_modules", "dist"]);

export function sourceFiles(dirs) {
  const files = [];
  const visit = (p) => {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(p).sort()) {
        if (!SKIPPED.has(name)) visit(path.join(p, name));
      }
    } else if (EXTENSIONS.has(path.extname(p))) {
      files.push(p);
    }
  };
  for (const d of dirs) visit(d);
  return files;
}
