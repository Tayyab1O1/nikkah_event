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

// Get the base URL - replace with your actual Vercel deployment URL
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL}`
  : 'https://your-vercel-url.vercel.app'; // TODO: Replace with your actual Vercel URL

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
    url: '/',
    siteName: 'Nikkah Invitation',
    images: [
      {
        url: '/front.png',
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
    images: ['/front.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
