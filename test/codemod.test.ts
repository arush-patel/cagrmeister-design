// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { expect, test } from "vitest";
// @ts-expect-error plain ESM JavaScript
import { rewriteClasses } from "../bin/codemod_core.mjs";

test.each([
  ['<a className="app-light:text-gray-900 app-dark:text-gray-100 font-bold" />', '<a className="text-text font-bold" />'],
  ['<a className="text-gray-900 app-dark:text-gray-100" />', '<a className="text-text" />'],
  ['<a className="hover:bg-gray-100 app-dark:hover:bg-gray-800 bg-white app-dark:bg-gray-950" />', '<a className="hover:bg-panel bg-card" />'],
  ['<a className="bg-white/70 app-dark:bg-gray-950/70" />', '<a className="bg-card/70" />'],
  ['<a className="bg-gray-50 app-dark:bg-gray-900/40" />', '<a className="bg-panel" />'],
  ['<a className="bg-gray-50 app-dark:bg-gray-900/30" />', '<a className="bg-panel" />'],
  ['<a className="bg-gray-100 app-dark:bg-gray-900/40" />', '<a className="bg-panel" />'],
  ['<a className="bg-blue-50 app-dark:bg-blue-950/30" />', '<a className="bg-highlight" />'],
  ['<a className="bg-white/70 app-dark:bg-gray-950/40" />', '<a className="bg-white/70 app-dark:bg-gray-950/40" />'],
  ['<a className="bg-gray-900 app-dark:bg-gray-100" />', '<a className="bg-gray-900 app-dark:bg-gray-100" />'],
  ['<a className="my-text-gray-900x" />', '<a className="my-text-gray-900x" />'],
  ['<p className="text-gray-500">Don\'t</p>', '<p className="text-muted">Don\'t</p>'],
  ['<a className={`px-2 ${on ? "bg-blue-600" : "bg-white"} text-gray-900`} />', '<a className={`px-2 ${on ? "bg-blue" : "bg-card"} text-text`} />'],
])("rewriteClasses(%s)", (before, after) => {
  expect(rewriteClasses(before).code).toBe(after);
});

test("unmapped reports what it left", () => {
  expect(rewriteClasses('<a className="bg-gray-900 app-dark:bg-gray-100" />').unmapped).toEqual(["bg-gray-900", "app-dark:bg-gray-100"]);
});

test("the codemod CLI writes nothing without --write", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "codemod-"));
  const file = path.join(dir, "before.jsx");
  fs.copyFileSync("test/fixtures/codemod/before.jsx", file);
  const original = fs.readFileSync(file, "utf8");
  const dry = spawnSync("node", ["bin/design-codemod.mjs", dir], { encoding: "utf8" });
  expect(dry.status).toBe(0);
  expect(dry.stdout).toContain("before.jsx");
  expect(fs.readFileSync(file, "utf8")).toBe(original);
  const wet = spawnSync("node", ["bin/design-codemod.mjs", "--write", dir], { encoding: "utf8" });
  expect(wet.status).toBe(0);
  expect(fs.readFileSync(file, "utf8")).not.toBe(original);
  expect(fs.readFileSync(file, "utf8")).toContain("text-text");
});
