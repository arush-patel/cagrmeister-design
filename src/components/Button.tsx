import type { ButtonHTMLAttributes } from "react";

export function Button({
  variant = "default",
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" }) {
  const cls = `sim-btn${variant === "primary" ? " sim-btn-primary" : ""}${className ? ` ${className}` : ""}`;
  return <button {...rest} type={type} className={cls} />;
}
