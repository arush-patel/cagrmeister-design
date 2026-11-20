import { beforeEach, expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useTheme } from "../src/react/useTheme";
import { setOsDark } from "./helpers/media";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  setOsDark(false);
});

function Probe() {
  const { choice, resolved, setChoice } = useTheme();
  return (
    <div>
      <span data-testid="probe">{`${choice}|${resolved}`}</span>
      <button onClick={() => setChoice("dark")}>dark</button>
    </div>
  );
}

test("useTheme re-renders on a choice", () => {
  render(<Probe />);
  expect(screen.getByTestId("probe")).toHaveTextContent("system|light");
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByTestId("probe")).toHaveTextContent("dark|dark");
});
