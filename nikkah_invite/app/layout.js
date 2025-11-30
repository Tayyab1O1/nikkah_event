import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get the base URL - replace 'nikkah-event.vercel.app' with your actual Vercel URL
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Replace this with your actual Vercel deployment URL
  return 'https://nikkah-event.vercel.app';
};

const baseUrl = getBaseUrl();

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "Nikkah Invitation - Tayyab & Areej",
  description: "You are warmly invited to our Nikkah ceremony. Join us in celebrating this special day.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Nikkah Invitation - Tayyab & Areej",
    description: "You are warmly invited to our Nikkah ceremony. Join us in celebrating this special day.",
    url: baseUrl,
    siteName: 'Nikkah Invitation',
    images: [
      {
        url: `${baseUrl}/front.png`,
        width: 1200,
        height: 630,
        alt: 'Nikkah Invitation Card - Tayyab & Areej',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nikkah Invitation - Tayyab & Areej",
    description: "You are warmly invited to our Nikkah ceremony. Join us in celebrating this special day.",
    images: [`${baseUrl}/front.png`],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Explicit meta tags for WhatsApp compatibility */}
        <meta property="og:image" content={`${baseUrl}/front.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="Nikkah Invitation Card - Tayyab & Areej" />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Nikkah Invitation - Tayyab & Areej" />
        <meta property="og:description" content="You are warmly invited to our Nikkah ceremony. Join us in celebrating this special day." />
        <meta name="twitter:image" content={`${baseUrl}/front.png`} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
