import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visionary Geometry | StudioView",
  description:
    "Logic to Aesthetics. A minimalist space bringing new life to your 3D assets.",
};

import { MainHeader } from "@/components/layout/MainHeader";
import { AccountButton } from "@/components/layout/AccountButton";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen overflow-x-hidden bg-[#f3f4f6]`}
      >
        <LanguageProvider>
          <MainHeader />
          <AccountButton />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
