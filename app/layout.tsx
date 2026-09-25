// PLAIN-ENGLISH OVERVIEW
// This is the "frame" that wraps every single page of the Pomfret Voices website.
// Next.js (the toolkit this site is built with) automatically puts each page's content inside
// this frame, so everything here shows up everywhere: the brand fonts, the menu bar at the top
// (Header), the bottom section (Footer, which carries the AI-bias acknowledgment that must
// appear on every page), a "skip to main content" link for keyboard and screen-reader users,
// and behind-the-scenes information that search engines and social media previews read.
// Works with: components/layout/Header.tsx, components/layout/Footer.tsx,
// components/ui/MotionProvider.tsx (animations), components/seo/JsonLd.tsx (search-engine
// information), and app/globals.css (site-wide styles).
import type { Metadata } from 'next';
import { DM_Serif_Display, Poppins } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MotionProvider from '@/components/ui/MotionProvider';
import JsonLd from '@/components/seo/JsonLd';
import './globals.css';

// Load the two brand fonts from Google Fonts: DM Serif Display for headings and Poppins for
// body text. Each gets a nickname (--font-display, --font-body) that the styles refer to.
// "display: swap" shows a plain font right away and swaps in the brand font once it has
// loaded, so visitors never stare at invisible text.
const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Prefer the explicit site URL from env so social previews always point at the real domain.
// Falls back to Vercel's deployment URL, or localhost during development.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// Information about the site that visitors don't see on the page itself, but that browsers,
// search engines (like Google), and social media link previews read: the title on the browser
// tab, a short description, and how the preview card looks when someone shares a link.
// Individual pages can replace any of these with their own.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Each page's own title is dropped in where "%s" is, e.g. "Timeline | Pomfret Voices".
  title: {
    default: 'Pomfret Voices | Diversity, Equity & Inclusion',
    template: '%s | Pomfret Voices',
  },
  description:
    'A living archive celebrating the diverse voices, histories, and stories that shape the Pomfret School community. Founded 1894, Pomfret, Connecticut.',
  keywords: [
    'Pomfret School',
    'diversity',
    'equity',
    'inclusion',
    'DEI',
    'timeline',
    'living archive',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pomfret Voices | Diversity, Equity & Inclusion',
    description:
      'A living archive celebrating the diverse voices, histories, and stories that shape the Pomfret School community.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Pomfret Voices',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomfret Voices | Diversity, Equity & Inclusion',
    description:
      'A living archive of diversity, equity, and inclusion at Pomfret School.',
  },
  // Tell search engines they may list these pages and follow their links.
  robots: {
    index: true,
    follow: true,
  },
};

// Baseline schema.org JSON-LD describing the site itself. Loaded on every page.
// In plain terms: it tells search engines, in a standard format they understand, that this
// site belongs to Pomfret School, where the school is, and how to contact it.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'Pomfret School',
      alternateName: 'Pomfret Voices',
      url: siteUrl,
      foundingDate: '1894-10-03',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '398 Pomfret Street, PO Box 128',
        addressLocality: 'Pomfret',
        addressRegion: 'CT',
        postalCode: '06258-0128',
        addressCountry: 'US',
      },
      telephone: '+1-860-963-6100',
      sameAs: ['https://www.pomfret.org'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Pomfret Voices',
      description:
        'A living archive of diversity, equity, and inclusion at Pomfret School.',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-US',
    },
  ],
};

// The frame itself. Next.js hands it "children": the content of whichever page the visitor
// opened. It gives back the full page, with that content placed in the middle.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Build the page. lang="en" tells screen readers to read it in English, and the two font
  // nicknames are switched on for the whole page.
  return (
    <html lang="en" className={`${dmSerif.variable} ${poppins.variable}`}>
      <body className="font-body antialiased bg-warm-white text-charcoal">
        {/* The hidden search-engine information described above, added to every page. */}
        <JsonLd data={organizationJsonLd} />
        {/* "Skip to main content" link: invisible until a keyboard user presses Tab, */}
        {/* then it appears at the top so they can jump past the menu to the page content. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-cream focus:rounded-lg"
        >
          Skip to main content
        </a>
        {/* Switch on the animation toolkit (Framer Motion) for everything inside. */}
        <MotionProvider>
          {/* The menu bar at the top of every page. */}
          <Header />
          {/* The page's own content goes here. Its id matches the skip link's target above. */}
          <main id="main-content">
            {children}
          </main>
          {/* The bottom section, including the AI-bias acknowledgment (links to /ai-bias). */}
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
