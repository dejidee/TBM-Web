import { Inter, Manrope, Poppins, Titillium_Web } from "next/font/google";
import "./globals.css";

import Providers from "@/components/common/providers";

const titilum = Titillium_Web({
  variable: "--font-titilum",
  subsets: ["latin"],
  weight: ["200", "300", "400"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});
const manRope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "TBM Building Services: Design. Price. Build.",
    template: "%s | TBM Building Services",
  },

  description:
    "Premium renovation, construction materials, and AI-powered space visualization for homes and commercial spaces across Abuja and Lagos. Powered by Ziora AI and Bogat materials.",
  metadataBase: new URL("https://tbmbuilding.com"),
  keywords: [
    "TBM Building Services",
    "renovation Abuja",
    "construction Nigeria",
    "interior design Abuja",
    "bathroom renovation Lagos",
    "Ziora AI design",
    "Bogat materials Nigeria",
    "building materials Abuja",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://tbmbuilding.com",
    siteName: "TBM Building Services",
    title: "TBM Building Services: Design. Price. Build.",
    description:
      "Premium renovation, AI-powered design with Ziora, and certified materials from Bogat, all in one platform across Abuja and Lagos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TBM Building Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TBM Building Services",
    description:
      "Premium renovation, materials, and AI visualization across Nigeria.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: "ot_-Joi-Cyk2QcWuM6_44SWPCTQKRUTSZA_8JOSs-UU",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${titilum.variable} ${inter.variable} ${manRope.variable} ${poppins.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
