import type { Metadata, Viewport } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Projektsteuerung – Strukturierte Dienstübergaben",
  description:
    "Projektsteuerung für die Einführung strukturierter Dienstübergaben, Maria-Hötte-Stift",
  applicationName: "Dienstübergaben",
  appleWebApp: {
    capable: true,
    title: "Dienstübergaben",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#CC0000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={firaSans.className}>{children}</body>
    </html>
  );
}
