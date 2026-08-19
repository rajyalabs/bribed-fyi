import type { Metadata } from "next";
import { DM_Mono, Inter, Playfair_Display } from "next/font/google";
import { BottomTabs } from "@/components/BottomTabs";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ThemeScript } from "@/components/ThemeScript";
import { ReportsProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://bribed.fyi"),
  title: "bribed.fyi",
  description:
    "Anonymous, first-hand reports of bribes demanded across India — by department, city and amount — as an open dataset. Continuing the work of bribes.fyi, which has shut down.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "bribed.fyi",
    description: "What people are being asked to pay, office by office, city by city.",
    siteName: "bribed.fyi",
    url: "https://bribed.fyi",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "bribed.fyi — India's crowdsourced bribe registry" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "bribed.fyi",
    description: "What people are being asked to pay, office by office, city by city.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${dmMono.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ReportsProvider>
          <div className="page-wrap">
            <Nav />
            <main className="main-content">
              <div className="page-container">{children}</div>
            </main>
            <Footer />
            <BottomTabs />
          </div>
        </ReportsProvider>
      </body>
    </html>
  );
}
