"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ToastNotice } from "@/components/ui/ToastNotice";
import { loginAction } from "@/server/actions";
import { PasswordField } from "./PasswordField";

export function SignInForm({ next, studio }: { next: string; studio: boolean }) {
  const [username, setUsername] = useState("");
  const [result, submit, pending] = useActionState(loginAction, { attempt: 0, error: "" });
  const Icon = pending ? LoaderCircle : ArrowRight;

  return <>
    <form className="form-stack" action={submit}>
      <input type="hidden" name="next" value={next} />
      {studio && <input type="hidden" name="studio" value="1" />}
      <label>Username<input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Your username" required maxLength={40}
        value={username} onChange={(event) => setUsername(event.target.value)} /></label>
      <PasswordField key={result.attempt} />
      <Button className="sign-in-button" type="submit" disabled={pending} data-pending={pending || undefined}>
        <Icon className={pending ? "loading-spinner" : undefined} size={17} aria-hidden="true" />
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
    <span className="sr-only" role="status">{pending ? "Signing in" : ""}</span>
    {!pending && result.error && <ToastNotice key={result.attempt} tone="error" message={result.error} />}
  </>;
}
