import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Origo Atelier | From Origin to Excellence",
  description: "Origo Atelier is a premium experiential design studio. Every experience begins with an idea. We believe in finding the origin of that idea and building from there.",
  keywords: ["Origo Atelier", "Experiential Design", "Brand Activation", "MICE", "Retail Marketing", "From Origin to Excellence", "Spatial Design"],
  authors: [{ name: "Origo Atelier" }],
  creator: "Origo Atelier",
  publisher: "Origo Atelier",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://origoatelier.com'),
  openGraph: {
    title: "Origo Atelier | From Origin to Excellence",
    description: "Every experience begins with an idea. We believe in finding the origin of that idea and building from there.",
    url: "https://origoatelier.com",
    siteName: "Origo Atelier",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Origo Atelier Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Origo Atelier | From Origin to Excellence",
    description: "Every experience begins with an idea. We believe in finding the origin of that idea and building from there.",
    images: ["/og.png"],
    creator: "@origoatelier",
  },
  icons: {
    icon: [
      { url: "/og.png", sizes: "any", type: "image/png" },
    ],
    apple: [
      { url: "/og.png", sizes: "any", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&family=Manrope:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />
        
        {/* Additional favicon for better browser support */}
        <link rel="icon" type="image/png" sizes="32x32" href="/og.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/og.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/og.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/og.png" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
