import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apex Blueprint | Interactive 3D Luxury Home Configurator",
  description: "Customize your cantilevered beachfront architectural villa in real-time. Toggle high-end structural materials, customize luxury flooring, and lock signature blueprints for development scoping.",
  keywords: ["Luxury Configurator", "3D Architecture", "Modernist Villa", "Bespoke Builder", "Malibu Custom Home", "Apex Blueprint"],
  authors: [{ name: "Apex Design Labs" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased select-none text-neutral-200">
        {children}
      </body>
    </html>
  );
}
