import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Innernet",
  description: "A personal digital habitat — a calm, adaptive homepage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
