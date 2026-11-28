"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

export function PasswordField() {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return <div className="password-field">
    <label htmlFor={inputId}>Password</label>
    <div className="password-input">
      <input id={inputId} name="password" type={visible ? "text" : "password"} autoComplete="current-password" placeholder="Your password" required maxLength={128} />
      <button type="button" aria-controls={inputId} aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>
        <Icon size={16} aria-hidden="true" />
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  </div>;
}
