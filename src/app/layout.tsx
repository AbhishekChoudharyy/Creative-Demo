import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1E90FF",
  width: "device-width",
  initialScale: 1,
};

// Determine canonical base URL dynamically to ensure WhatsApp and social crawlers resolve images correctly
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://origoatelier.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Origo Atelier | From Origin to Excellence",
  description: "Origo Atelier is a premier experiential design studio. We transform ideas into bold immersive experiences, spatial activations, anamorphic 3D, and exhibitions. From origin to excellence.",
  keywords: [
    "Origo Atelier",
    "Origo",
    "Experiential Design",
    "Brand Activation",
    "MICE",
    "Retail Marketing",
    "Spatial Design",
    "Anamorphic 3D",
    "From Origin to Excellence",
    "London"
  ],
  authors: [{ name: "Origo Atelier", url: siteUrl }],
  creator: "Origo Atelier",
  publisher: "Origo Atelier",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Origo Atelier | From Origin to Excellence",
    description: "Every experience begins with an idea. We find the origin and engineer excellence. Experiential design studio specializing in brand activations and immersive spaces.",
    url: siteUrl,
    siteName: "Origo Atelier",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Origo Atelier — From Origin to Excellence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Origo Atelier | From Origin to Excellence",
    description: "Every experience begins with an idea. We find the origin and engineer excellence.",
    images: ["/og-image.png"],
    creator: "@origoatelier",
    site: "@origoatelier",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#1E90FF",
      },
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
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&family=Manrope:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* WhatsApp & Social Media Preview Meta Tags */}
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:image:secure_url" content={`${siteUrl}/og-image.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Origo Atelier — From Origin to Excellence" />
        <link rel="image_src" href={`${siteUrl}/og-square.png`} />
        <meta itemProp="image" content={`${siteUrl}/og-square.png`} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
