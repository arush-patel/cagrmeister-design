#!/usr/bin/env node
// cagr-design-codemod [--write] <dir…> — dry run by default; --write saves the rewrites.
import fs from "node:fs";
import { rewriteClasses } from "./codemod_core.mjs";
import { missingPath, sourceFiles } from "./walk.mjs";

const args = process.argv.slice(2);
const write = args.includes("--write");
const dirs = args.filter((a) => !a.startsWith("--"));
if (dirs.length === 0) {
  console.error("usage: cagr-design-codemod [--write] <dir…>");
  process.exit(2);
}
const missing = missingPath(dirs);
if (missing !== undefined) {
  console.error(`cagr-design-codemod: no such directory: ${missing}`);
  process.exit(2);
}

let replaced = 0;
let unmapped = 0;
for (const file of sourceFiles(dirs)) {
  const source = fs.readFileSync(file, "utf8");
  let result;
  try {
    result = rewriteClasses(source);
  } catch (err) {
    console.log(`${file}: skipped (${err.message})`);
    continue;
  }
  if (result.replaced === 0 && result.unmapped.length === 0) continue;
  console.log(`${file}: ${result.replaced} replaced${result.unmapped.length ? `, unmapped: ${result.unmapped.join(" ")}` : ""}`);
  replaced += result.replaced;
  unmapped += result.unmapped.length;
  if (write && result.code !== source) fs.writeFileSync(file, result.code);
}
console.log(`${replaced} replaced, ${unmapped} unmapped${write ? " (written)" : " (dry run; pass --write to save)"}`);
