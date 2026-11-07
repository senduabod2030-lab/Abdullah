import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "لوحة العادات — القرآن والإنجليزية", description: "جدولة وتتبع يومي وأسبوعي وسنوي" };
export const viewport: Viewport = { themeColor: "#080e0c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
