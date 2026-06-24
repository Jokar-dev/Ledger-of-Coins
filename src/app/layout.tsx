import type { Metadata } from "next";
import { EB_Garamond, Source_Serif_4, Space_Mono } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({ 
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif-4",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ledger of the Wanderers",
  description: "Track thy gold, manage thy expeditions, and conquer thy finances.",
};

// Material Symbols is loaded via globals.css @import below
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body
        className={`${ebGaramond.variable} ${sourceSerif4.variable} ${spaceMono.variable} font-body-md bg-background text-on-background antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
