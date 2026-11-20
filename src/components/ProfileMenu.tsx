import { useEffect, useRef, useState, type ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle.js";

function MenuIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="hdr-profile-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function UserCogIcon() {
  return (
    <MenuIcon>
      <circle cx="18" cy="15" r="3" />
      <circle cx="9" cy="7" r="4" />
      <path d="M10 15H6a4 4 0 0 0-4 4v2" />
      <path d="m21.7 16.4-.9-.3m-5.6-2.2-.9-.3m2.3 5.4.3-.9m2.2-5.6.3-.9m.2 7.4-.4-1m-2.4-5.4-.4-1m-2.1 5.3 1-.4m5.4-2.4 1-.4" />
    </MenuIcon>
  );
}

function LogOutIcon() {
  return (
    <MenuIcon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </MenuIcon>
  );
}

/** Top-right session menu: who is signed in, plus an optional change-password and a logout. */
export function ProfileMenu({
  label,
  onLogout,
  onChangePassword,
  logoutNote = "You will be signed out of the CAGRMeister apps.",
}: {
  label: string;
  onLogout: () => void;
  onChangePassword?: () => void;
  logoutNote?: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open && !confirmLogout) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      setConfirmLogout(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, confirmLogout]);

  useEffect(() => {
    if (confirmLogout) cancelRef.current?.focus();
  }, [confirmLogout]);

  return (
    <div className="hdr-profile" data-testid="signed-in" ref={rootRef}>
      <button
        type="button"
        className="hdr-profile-btn"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
      >
        <span className="hdr-profile-badge" aria-hidden="true">
          <UserCogIcon />
        </span>
        <span className="hdr-profile-label">{label}</span>
      </button>
      {open && (
        <div className="hdr-profile-pop" role="menu" aria-label="Account">
          <div className="hdr-profile-section">
            <div className="hdr-profile-kicker">Appearance</div>
            <ThemeToggle />
          </div>
          <div className="hdr-profile-rule" />
          {onChangePassword && (
            <button type="button" role="menuitem" className="hdr-profile-item" onClick={() => onChangePassword()}>
              <UserCogIcon />
              <span>Change Password</span>
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="hdr-profile-item is-logout"
            onClick={() => {
              setOpen(false);
              setConfirmLogout(true);
            }}
          >
            <LogOutIcon />
            <span>Logout</span>
          </button>
        </div>
      )}
      {confirmLogout && (
        <div className="hdr-logout-backdrop" onMouseDown={() => setConfirmLogout(false)}>
          <div
            className="hdr-logout-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="hdr-logout-title"
            aria-describedby="hdr-logout-body"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="hdr-logout-title">Log out?</h2>
            <p id="hdr-logout-body">{logoutNote}</p>
            <div className="hdr-logout-actions">
              <button ref={cancelRef} type="button" onClick={() => setConfirmLogout(false)}>
                Cancel
              </button>
              <button type="button" className="is-logout" onClick={() => onLogout()}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
