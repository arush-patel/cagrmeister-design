// @vitest-environment node
import fs from "node:fs";
import { expect, test } from "vitest";
// @ts-expect-error plain ESM JavaScript
import { PAIRS, SINGLES } from "../bin/class_map.mjs";

test("every mapped class names a token theme.css defines", () => {
  const theme = fs.readFileSync("src/css/theme.css", "utf8");
  const classes = [...Object.values(PAIRS), ...Object.values(SINGLES)] as string[];
  expect(classes.length).toBeGreaterThan(40);
  for (const cls of classes) {
    const name = cls.replace(/^placeholder:/, "").replace(/^(bg|text|border)-/, "").replace(/\/\d+$/, "");
    expect(theme).toContain(`--color-${name}:`);
  }
});
