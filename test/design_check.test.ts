// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { expect, test } from "vitest";
// @ts-expect-error plain ESM JavaScript
import { checkSource } from "../bin/check_core.mjs";

const read = (f: string) => fs.readFileSync(path.join("test/fixtures/check", f), "utf8");

test("dirty.jsx finds one of each rule; clean.jsx finds none", () => {
  const rules = checkSource(read("dirty.jsx")).map((f: { rule: string }) => f.rule).sort();
  expect(rules).toEqual([
    "gradient",
    "hex-colour",
    "hex-colour",
    ...Array(13).fill("palette-class"),
    "theme-variant",
  ]);
  expect(checkSource(read("clean.jsx"))).toEqual([]);
});

test("--no-hex and // design-ok skip what they say", () => {
  const src = read("dirty.jsx");
  const withHex = checkSource(src);
  const noHex = checkSource(src, { hex: false });
  expect(withHex.filter((f: { rule: string }) => f.rule === "hex-colour")).toHaveLength(2);
  expect(noHex.filter((f: { rule: string }) => f.rule === "hex-colour")).toEqual([]);
  expect(withHex.some((f: { line: number }) => f.line === 6)).toBe(false);
});

test("a token tripping both palette-class and theme-variant reports both", () => {
  const rules = checkSource('<p className="app-dark:bg-gray-900" />').map((f: { rule: string }) => f.rule).sort();
  expect(rules).toEqual(["palette-class", "theme-variant"]);
});

test("the CLI exits 1 on dirty and 0 on clean", () => {
  const run = (f: string) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-"));
    fs.copyFileSync(path.join("test/fixtures/check", f), path.join(dir, f));
    return spawnSync("node", ["bin/design-check.mjs", dir], { encoding: "utf8" });
  };
  const dirty = run("dirty.jsx");
  expect(dirty.status).toBe(1);
  expect(dirty.stdout).toContain("palette-class");
  expect(run("clean.jsx").status).toBe(0);
});

test.each([
  "!text-gray-900",
  "text-gray-900!",
  "bg-white/[0.7]",
  "bg-gray-500/(--a)",
  "bg-gray-500/12.5",
  "border-s-gray-300",
  "border-e-gray-300",
  "ring-offset-white",
  "inset-shadow-gray-200",
  "inset-ring-gray-200",
  "text-shadow-gray-200",
  "drop-shadow-gray-200",
  "hover:!bg-gray-100",
])("%s is a palette class", (token) => {
  const found = checkSource(`<p className="${token}" />`);
  expect(found.map((f: { rule: string; token: string }) => `${f.rule} ${f.token}`)).toEqual([`palette-class ${token}`]);
});

test.each([
  ["cagr-design-check", ["bin/design-check.mjs"]],
  ["cagr-design-codemod", ["bin/design-codemod.mjs"]],
])("%s names a missing directory and exits 2", (_name, args) => {
  const r = spawnSync("node", [...args, "/no/such/dir-xyz"], { encoding: "utf8" });
  expect(r.status).toBe(2);
  expect(r.stderr).toContain("no such directory: /no/such/dir-xyz");
  expect(r.stderr).not.toContain("ENOENT");
});

test("the CLI --no-hex hides hex findings but keeps the rest", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-"));
  fs.copyFileSync("test/fixtures/check/dirty.jsx", path.join(dir, "dirty.jsx"));
  const withHex = spawnSync("node", ["bin/design-check.mjs", dir], { encoding: "utf8" });
  const noHex = spawnSync("node", ["bin/design-check.mjs", "--no-hex", dir], { encoding: "utf8" });
  expect(withHex.stdout).toContain("hex-colour");
  expect(noHex.stdout).not.toContain("hex-colour");
  expect(noHex.stdout).toContain("palette-class");
  expect(noHex.status).toBe(1);
});
