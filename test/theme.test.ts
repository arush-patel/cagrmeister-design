import { beforeEach, expect, test, vi } from "vitest";
import { currentTheme, initTheme, onThemeChange, resolvedTheme, setTheme } from "../src/theme";
import { fireOsChange, setOsDark } from "./helpers/media";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  setOsDark(false);
});

test("system is the default and stamps nothing", () => {
  expect(initTheme()).toBe("system");
  expect(document.documentElement.dataset.theme).toBeUndefined();
});
test("an explicit choice persists and stamps; system clears both", () => {
  setTheme("dark");
  expect(localStorage.getItem("cagrmeister:theme")).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
  setTheme("system");
  expect(localStorage.getItem("cagrmeister:theme")).toBeNull();
  expect(document.documentElement.dataset.theme).toBeUndefined();
});
test.each(["observatory:theme", "cagr-theme", "cagr-accounts-theme", "cagr-portfolio-theme"])(
  "a saved choice under %s is carried over once",
  (key) => {
    localStorage.setItem(key, "light");
    expect(initTheme()).toBe("light");
    expect(localStorage.getItem("cagrmeister:theme")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  },
);
const LEGACY = ["observatory:theme", "cagr-theme", "cagr-accounts-theme", "cagr-portfolio-theme"];
test("choosing system after a carry-over survives a reload", () => {
  localStorage.setItem("observatory:theme", "dark");
  expect(initTheme()).toBe("dark");
  setTheme("system");
  expect(initTheme()).toBe("system");
  expect(document.documentElement.dataset.theme).toBeUndefined();
  for (const k of LEGACY) expect(localStorage.getItem(k)).toBeNull();
});
test("the new key wins over a legacy key, and the legacy key is removed", () => {
  localStorage.setItem("cagrmeister:theme", "dark");
  localStorage.setItem("cagr-theme", "light");
  expect(initTheme()).toBe("dark");
  expect(localStorage.getItem("cagr-theme")).toBeNull();
});
test("a second initTheme after a carry-over returns the same choice", () => {
  localStorage.setItem("cagr-accounts-theme", "light");
  expect(initTheme()).toBe("light");
  expect(initTheme()).toBe("light");
});
test("a legacy 'system' carries nothing over", () => {
  localStorage.setItem("cagr-theme", "system");
  expect(initTheme()).toBe("system");
  expect(localStorage.getItem("cagrmeister:theme")).toBeNull();
});
test("an unknown stored value reads as system", () => {
  localStorage.setItem("cagrmeister:theme", "blue");
  expect(currentTheme()).toBe("system");
});
test("blocked storage never throws and still stamps", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  expect(currentTheme()).toBe("system");
  expect(() => setTheme("dark")).not.toThrow();
  expect(document.documentElement.dataset.theme).toBe("dark");
});
test("resolvedTheme follows the OS only under system", () => {
  setOsDark(true);
  expect(resolvedTheme()).toBe("dark");
  setTheme("light");
  expect(resolvedTheme()).toBe("light");
});
test("onThemeChange fires on setTheme and on an OS change, and unsubscribes", () => {
  const fn = vi.fn();
  const off = onThemeChange(fn);
  setTheme("dark");
  fireOsChange();
  expect(fn).toHaveBeenCalledTimes(2);
  off();
  setTheme("light");
  expect(fn).toHaveBeenCalledTimes(2);
});
