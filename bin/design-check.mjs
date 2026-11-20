#!/usr/bin/env node
// cagr-design-check [--no-hex] <dir…> — reports off-system colours; exits 1 on any finding.
import fs from "node:fs";
import { checkSource } from "./check_core.mjs";
import { sourceFiles } from "./walk.mjs";

const args = process.argv.slice(2);
const hex = !args.includes("--no-hex");
const dirs = args.filter((a) => !a.startsWith("--"));
if (dirs.length === 0) {
  console.error("usage: cagr-design-check [--no-hex] <dir…>");
  process.exit(2);
}

let total = 0;
for (const file of sourceFiles(dirs)) {
  for (const f of checkSource(fs.readFileSync(file, "utf8"), { hex })) {
    console.log(`${file}:${f.line} ${f.rule} ${f.token}`);
    total++;
  }
}
console.log(`${total} finding${total === 1 ? "" : "s"}`);
process.exit(total > 0 ? 1 : 0);
