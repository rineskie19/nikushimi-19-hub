"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { themeCookie, type Theme } from "@/lib/site";
import { Button } from "./ui/Button";

const choices = [
  { theme: "dark", label: "Dark mode", Icon: Moon },
  { theme: "light", label: "Light mode", Icon: Sun },
] as const;

export function ThemeSwitch({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState(initialTheme);

  function choose(next: Theme) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.cookie = themeCookie + "=" + next + "; Path=/; Max-Age=31536000; SameSite=Lax";
  }

  return <div className="theme-switch" role="group" aria-label="Color theme">
    {choices.map(({ theme: value, label, Icon }) =>
      <Button key={value} variant="quiet" aria-pressed={theme === value} aria-label={label} title={label} onClick={() => choose(value)}>
        <Icon size={18} aria-hidden="true" />
      </Button>,
    )}
  </div>;
}
