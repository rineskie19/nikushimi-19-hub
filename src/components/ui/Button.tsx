import type { ComponentProps } from "react";
import Link from "next/link";
import styles from "./Button.module.scss";

type Variant = "primary" | "secondary" | "quiet";
type Appearance = { variant?: Variant; className?: string };

export function buttonClassName(variant: Variant = "primary", className?: string) {
  return [styles.button, styles[variant], className].filter(Boolean).join(" ");
}

export function Button({ variant, className, type = "button", ...props }: ComponentProps<"button"> & Appearance) {
  return <button {...props} type={type} className={buttonClassName(variant, className)} />;
}

export function ButtonLink({ variant, className, ...props }: ComponentProps<typeof Link> & Appearance) {
  return <Link {...props} className={buttonClassName(variant, className)} />;
}

export function ExternalButtonLink({ variant, className, ...props }: Omit<ComponentProps<"a">, "target" | "rel"> & Appearance) {
  return <a {...props} target="_blank" rel="noopener noreferrer" className={buttonClassName(variant, className)} />;
}
