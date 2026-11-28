import { ButtonLink } from "@/components/ui/Button";
export default function NotFound() {
  return <main className="shell empty-page"><section className="panel notice"><h1>Page unavailable</h1><p>This page may have moved or been unpublished.</p><ButtonLink href="/">All downloads</ButtonLink></section></main>;
}
