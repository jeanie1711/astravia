import type { Metadata } from "next";
import { DM_Sans, Fraunces, Inter, Lora } from "next/font/google";
import type { ReactNode } from "react";
import { JourneyProvider } from "./journey/JourneyContext";
import { LanguageProvider } from "../i18n/LanguageContext";
import "./globals.css";

// <LanguageToggle /> is intentionally not rendered here (2026-09-13): the
// switcher shipped but toggling proved inconsistent across the app, so
// it's disabled at the source (src/i18n/LanguageContext.tsx's
// SWITCHER_ENABLED) until that's root-caused. LanguageProvider stays in
// the tree since every component still calls useLanguage()/
// useTranslation(); with the switch disabled it always resolves to "en".

// "vietnamese" subset added for the language switcher (2026-09-12) so
// Vietnamese diacritics render from the webfont instead of falling back
// per-glyph to a system font. DM Sans has no "vietnamese" subset on
// Google Fonts -- its home-page Vietnamese text will fall back to the
// next font in the stack for glyphs it lacks, a known minor limitation.
const lora = Lora({ subsets: ["latin", "vietnamese"], weight: ["500", "600"], variable: "--font-lora" });
const inter = Inter({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], variable: "--font-inter" });
// Home screen only (2026-09-11 handoff): Fraunces/DM Sans give the hero its
// editorial character. Not swapped in as the app-wide --font-display/
// --font-body tokens -- every other screen keeps Lora/Inter unchanged.
const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces"
});
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Astravia",
  description: "Discover the places that stand out in your astrocartography, and understand why."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} ${fraunces.variable} ${dmSans.variable}`}>
      <body>
        <LanguageProvider>
          <JourneyProvider>{children}</JourneyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
