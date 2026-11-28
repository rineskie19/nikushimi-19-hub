import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import { themeCookie } from "@/lib/site";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Nikushimi19 · Download Hub", template: "%s · Nikushimi19" },
  description: "Android and Windows builds, release notes and setup guides from Nikushimi19.",
  icons: { icon: "/mark.svg" },
};

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = (await cookies()).get(themeCookie)?.value === "light" ? "light" : "dark";
  return <html lang="en" data-theme={theme}><body><Brand theme={theme} />{children}<SiteFooter /></body></html>;
}
