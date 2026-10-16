import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sarkari Update Hub | सरकारी नौकरी, एडमिट कार्ड और रिजल्ट",
  description: "भारत की सरकारी भर्ती, एडमिट कार्ड, परीक्षा तिथि और रिजल्ट की जानकारी। आवेदन से पहले आधिकारिक नोटिफिकेशन जरूर देखें।",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="hi"><body>{children}</body></html>;
}