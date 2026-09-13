import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeStyles } from "@/components/theme-styles";
import { getSiteSettings } from "@/lib/db/cms";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tenis Futuro | Fundación",
  description:
    "Formamos personas, transformamos futuros. Fundación de tenis juvenil.",
};

/** Colores CMS desde MongoDB en cada request */
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let settings = null;
  try {
    settings = await getSiteSettings();
  } catch (err) {
    console.error("[RootLayout] settings", err);
  }

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {settings ? <ThemeStyles settings={settings} /> : null}
        {children}
      </body>
    </html>
  );
}
