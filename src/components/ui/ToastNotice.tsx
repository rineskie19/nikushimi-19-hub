"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { useState } from "react";

export function ToastNotice({ tone, message }: { tone: "error" | "success"; message: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return <div className="toast-notice" data-tone={tone}>
    <Icon className="toast-icon" size={20} aria-hidden="true" />
    <p role={tone === "error" ? "alert" : "status"}>{message}</p>
    <button type="button" aria-label="Dismiss notification" onClick={() => setDismissed(true)}>
      <X size={17} aria-hidden="true" />
    </button>
  </div>;
}
