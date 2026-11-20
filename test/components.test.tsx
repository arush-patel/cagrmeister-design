import { beforeEach, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
  AppHeader,
  Button,
  FigureBand,
  ProfileMenu,
  TabStrip,
  ThemeToggle,
} from "../src/index";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

test("the profile menu offers change password and log out", () => {
  render(<ProfileMenu label="Signed in" onLogout={() => {}} onChangePassword={() => {}} />);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Signed in" }));
  expect(screen.getByRole("menuitem", { name: "Change Password" })).toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: "Logout" })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("log out asks for confirmation and cancel keeps the session", () => {
  const onLogout = vi.fn();
  render(<ProfileMenu label="Signed in" onLogout={onLogout} onChangePassword={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Signed in" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Logout" }));
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  const dialog = screen.getByRole("alertdialog", { name: "Log out?" });
  expect(dialog).toHaveTextContent("You will be signed out of the CAGRMeister apps.");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Signed in" })).toBeInTheDocument();
  expect(onLogout).not.toHaveBeenCalled();
});

test("Change Password is absent without a handler", () => {
  render(<ProfileMenu label="Signed in" onLogout={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Signed in" }));
  expect(screen.queryByRole("menuitem", { name: "Change Password" })).toBeNull();
});

test("confirming log out calls onLogout once", () => {
  const onLogout = vi.fn();
  render(<ProfileMenu label="Signed in" onLogout={onLogout} />);
  fireEvent.click(screen.getByRole("button", { name: "Signed in" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Logout" }));
  fireEvent.click(screen.getByRole("button", { name: "Log out" }));
  expect(onLogout).toHaveBeenCalledTimes(1);
});

test("a custom logoutNote replaces the default", () => {
  render(<ProfileMenu label="Me" onLogout={() => {}} logoutNote="Bye." />);
  fireEvent.click(screen.getByRole("button", { name: "Me" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Logout" }));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("Bye.");
});

test("ThemeToggle stamps dark", () => {
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole("button", { name: "Dark" }));
  expect(screen.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");
  expect(document.documentElement.dataset.theme).toBe("dark");
});

test("TabStrip marks the current route active", () => {
  render(
    <MemoryRouter initialEntries={["/b"]}>
      <TabStrip tabs={[{ id: "a", label: "A", to: "/a" }, { id: "b", label: "B", to: "/b" }]} />
    </MemoryRouter>,
  );
  expect(screen.getByRole("tab", { name: "B" })).toHaveClass("view-tab", "active");
  expect(screen.getByRole("tab", { name: "A" })).not.toHaveClass("active");
});

test("AppHeader shows the logo, today's date and its children", () => {
  const { container } = render(
    <AppHeader logoSrc="/logo.png"><span>child-node</span></AppHeader>,
  );
  expect(screen.getByRole("img", { name: "CAGRMEISTER" })).toHaveAttribute("src", "/logo.png");
  const now = new Date();
  const time = container.querySelector("time")!;
  expect(time).toHaveAttribute("datetime", now.toISOString().slice(0, 10));
  expect(time).toHaveTextContent(now.toDateString());
  expect(screen.getByText("child-node")).toBeInTheDocument();
  expect(screen.getByTestId("shell-brand")).toBeInTheDocument();
});

test("AppHeader can hide the date", () => {
  const { container } = render(<AppHeader logoSrc="/l.png" showDate={false} />);
  expect(container.querySelector("time")).toBeNull();
});

test("FigureBand tones the value", () => {
  render(
    <FigureBand
      headline={{ label: "CAGR", value: "12%" }}
      figures={[{ label: "Max DD", value: "-9%", tone: "pos" }]}
    />,
  );
  const cell = screen.getByTestId("fig-max-dd");
  expect(cell.querySelector(".figure-band-value.pos")).not.toBeNull();
});

test("Button is type=button and primary adds the primary class", () => {
  render(<><Button>Plain</Button><Button variant="primary" className="x">Go</Button></>);
  const plain = screen.getByRole("button", { name: "Plain" });
  expect(plain).toHaveAttribute("type", "button");
  expect(plain.className).toBe("sim-btn");
  const go = screen.getByRole("button", { name: "Go" });
  expect(go.className).toBe("sim-btn sim-btn-primary x");
});
