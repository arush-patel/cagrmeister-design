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
  expect(rules).toEqual(["gradient", "hex-colour", "hex-colour", "palette-class", "palette-class", "theme-variant"]);
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
