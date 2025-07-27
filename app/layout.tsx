import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ひらがなおべんきょう",
  description: "ひらがなおべんきょう",
  generator: "ひらがなおべんきょう",
  icons: {
    icon: "/hiragana.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
