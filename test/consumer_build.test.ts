// @vitest-environment node
import path from "node:path";
import { expect, test } from "vitest";
import { buildConsumer } from "./helpers/build_consumer.js";

test("theme.css maps tokens to utilities and ships the fonts", async () => {
  const out = await buildConsumer("theme");
  expect(out.css).toMatch(/\.bg-card\s*\{\s*background-color:\s*var\(--card\)/);
  expect(out.css).toMatch(/--bg:\s*#fbfbf9/);
  expect(out.css).toMatch(/--on-accent:\s*#f{3}(f{3})?\b/);
  expect(out.css).toMatch(/\.bg-gray-500\s*\{/); // defaults stay on while an app migrates
  expect(out.fontFiles).toHaveLength(7);
  for (const f of out.fontFiles) expect(out.css).toContain(path.basename(f)); // the CSS points at each emitted file
});

test("strict.css removes the default palette and keeps every token", async () => {
  const out = await buildConsumer("strict");
  expect(out.css).not.toMatch(/\.bg-gray-500\s*\{/);
  expect(out.css).not.toMatch(/\.text-white\s*\{/);
  expect(out.css).toMatch(/\.bg-card\s*\{/);
  expect(out.css).toMatch(/\.text-on-accent\s*\{/);
  expect(out.css).toMatch(/\.bg-transparent\s*\{/);
});

test("compat.css makes app-dark follow the three-state rule", async () => {
  const out = await buildConsumer("compat");
  expect(out.css).toMatch(
    /@media \(prefers-color-scheme: dark\)[\s\S]*:root:not\(\[data-theme="?light"?\]\)/,
  );
  expect(out.css).toMatch(/\[data-theme="?dark"?\][\s\S]*color/);
});
