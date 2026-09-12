import type { Metadata } from "next";
import { DM_Sans, Fraunces, Inter, Lora } from "next/font/google";
import type { ReactNode } from "react";
import { JourneyProvider } from "./journey/JourneyContext";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-lora" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter" });
// Home screen only (2026-09-11 handoff): Fraunces/DM Sans give the hero its
// editorial character. Not swapped in as the app-wide --font-display/
// --font-body tokens -- every other screen keeps Lora/Inter unchanged.
const fraunces = Fraunces({
  subsets: ["latin"],
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
        <JourneyProvider>{children}</JourneyProvider>
      </body>
    </html>
  );
}
