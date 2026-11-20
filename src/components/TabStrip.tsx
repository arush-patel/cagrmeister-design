import { NavLink } from "react-router";

export type Tab = { id: string; label: string; to: string };

export function TabStrip({ tabs }: { tabs: Tab[] }) {
  return (
    <nav className="view-tabs" role="tablist">
      {tabs.map((t) => (
        <NavLink key={t.id} to={t.to} role="tab" className={({ isActive }) => `view-tab${isActive ? " active" : ""}`}>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
