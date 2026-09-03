import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import type { ReactNode } from "react";
import { JourneyProvider } from "./journey/JourneyContext";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-lora" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Astravia",
  description: "Discover the places that stand out in your astrocartography -- and understand why."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body>
        <JourneyProvider>{children}</JourneyProvider>
      </body>
    </html>
  );
}
