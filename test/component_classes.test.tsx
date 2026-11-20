import fs from "node:fs";
import { expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
  AppHeader,
  Button,
  FigureBand,
  InstrumentBar,
  Panel,
  ProfileMenu,
  TabStrip,
} from "../src/index";

function AllComponents() {
  return (
    <MemoryRouter initialEntries={["/a"]}>
      <AppHeader logoSrc="/l.png">
        <ProfileMenu label="Signed in" onLogout={() => {}} onChangePassword={() => {}} />
      </AppHeader>
      <TabStrip tabs={[{ id: "a", label: "A", to: "/a" }, { id: "b", label: "B", to: "/b" }]} />
      <Panel title="T" sub="s" meta="m" className="extra-not-ours">body</Panel>
      <InstrumentBar title="I" sub="s" controls={<Button variant="primary">Go</Button>} />
      <InstrumentBar title="J" sub="s" />
      <FigureBand
        headline={{ label: "H", value: "1", tone: "pos" }}
        figures={[{ label: "F", value: "2", sub: "x", tone: "neg" }, { label: "G", value: "3", tone: "wrn" }]}
      />
    </MemoryRouter>
  );
}

test("every class a shared component renders is defined in components.css", () => {
  const css = fs.readFileSync("src/css/components.css", "utf8");
  const { container } = render(<AllComponents />);
  const seen = new Set<string>();
  const collect = () =>
    container.ownerDocument.querySelectorAll("[class]").forEach((el) => el.classList.forEach((c) => seen.add(c)));
  collect();
  fireEvent.click(screen.getByRole("button", { name: "Signed in" }));
  collect();
  fireEvent.click(screen.getByRole("menuitem", { name: "Logout" }));
  collect();
  seen.delete("extra-not-ours"); // a consumer-supplied className, not ours
  seen.delete("figure-band-cell"); // a hook class the Observatory never styled; the grid lays it out
  const missing = [...seen].filter((c) => !new RegExp(`\\.${c}(?![\\w-])`).test(css));
  expect(missing).toEqual([]);
  expect(seen.size).toBeGreaterThan(20);
});
