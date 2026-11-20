import { expect, test } from "vitest";
import { tokenValue } from "../src/tokens";

test("tokenValue reads a custom property, else the fallback", () => {
  document.documentElement.style.setProperty("--card", "#123456");
  expect(tokenValue("--card")).toBe("#123456");
  expect(tokenValue("--missing", "#fff")).toBe("#fff");
  expect(tokenValue("--missing")).toBe("");
});
