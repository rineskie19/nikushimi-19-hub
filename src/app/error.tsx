"use client";

import { Button } from "@/components/ui/Button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="shell empty-page"><section className="panel notice"><h1>Hub temporarily unavailable</h1><p>Try again in a moment.</p><Button onClick={reset}>Try again</Button></section></main>;
}
