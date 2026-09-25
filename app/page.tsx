'use client';

// HOMEPAGE of the Pomfret Voices website: the page a visitor sees at the site's main address.
// In Next.js (a toolkit for building websites), every folder inside app/ becomes a page, and
// the file named page.tsx inside it is what gets shown. This file sits directly in app/, so it
// is the front door of the whole site.
// The page is five stacked sections, top to bottom: a full-screen photo slideshow, the mission
// statement, cards linking to the five main exhibits, portrait cards for six key "voices,"
// and a short list of recent stories.
// All the words are typed directly into this file (there is no database yet). Photos come from
// the public/heads/ folder. The shared site header and footer are wrapped around this page by
// app/layout.tsx.
// The 'use client' line at the very top tells Next.js to run this page in the visitor's
// browser, which is needed because the slideshow reacts to clicks and changes on its own.
//
// Tools this page borrows: Framer Motion (a library that animates things on screen), Next.js's
// Image and Link helpers (for fast-loading photos and links to other pages), React's memory
// tools, and two of this site's own building blocks: ScrollReveal (fades a piece in as you
// scroll to it) and SectionHeading (the big two-tone section titles).
import { m, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionHeading from '@/components/layout/SectionHeading';

// =================================================================
// SECTION 1: HERO — authentic Pomfret archival + campus imagery
// =================================================================
// Each slide pairs a headline with a real Pomfret photograph spanning the
// school's 130-year arc — from the 1894 founder on the Hilltop through the
// first female Head of School in 2025. `imagePosition` is tuned per slide so
// the subject's face stays visible after object-cover crops to viewport.
// The list of four slides. Each has a headline, an italic "accent" line, a short subtitle,
// the photo to show, which part of the photo to keep centered, and a caption naming who it is.
const heroSlides = [
  {
    id: 0,
    headline: 'A Living Archive of',
    accent: 'Every Voice',
    subtitle: 'Exploring the people, programs, and VOICES that continue to shape equity and belonging at Pomfret School.',
    image: '/heads/heather-willis-daly.jpg',
    imagePosition: '50% 25%',
    caption: 'Heather Willis Daly · Pomfret\u2019s first female Head of School',
  },
  {
    id: 1,
    headline: 'Every Story',
    accent: 'Matters Here',
    subtitle: 'Since 1894, Pomfret has grown from an all-boys school into a community shaped by student voice, coeducation, international perspective, and shared belonging.',
    image: '/heads/william-e-peck.png',
    // Peck is a full-body portrait with his face in the top ~18% of the frame.
    imagePosition: '50% 12%',
    caption: 'William E. Peck · Founder, on the Hilltop, 1894',
  },
  {
    id: 2,
    headline: 'More Than',
    accent: 'Four Decades',
    subtitle: 'Of diversity, integration, and intentional inclusion on the Hilltop.',
    image: '/heads/tim-richards.jpg',
    imagePosition: '50% 30%',
    caption: 'Tim Richards with students · Pomfret School',
  },
  {
    id: 3,
    headline: 'Change Makers.',
    accent: 'Problem Solvers.',
    subtitle: 'The people, programs, and milestones that define the Pomfret we are becoming.',
    image: '/heads/jay-milnor.jpg',
    imagePosition: '50% 20%',
    caption: 'Joseph \u201CJay\u201D Milnor · Headmaster who admitted Pomfret\u2019s first Black and first female students',
  },
];

// HeroSection builds the full-screen slideshow at the top of the homepage.
// React idea: a page is made of "components," reusable pieces written as functions. Each one
// hands back the markup (the HTML-like code) for its piece of the page. This one is given
// nothing and hands back the whole slideshow section.
function HeroSection() {
  // "State" is React's short-term memory: a value the page remembers, and when it changes React
  // redraws that part of the page. Here, "active" remembers which slide (0 to 3) is showing.
  const [active, setActive] = useState(0);
  // Auto-advance is off by default for users who prefer reduced motion.
  const prefersReducedMotion = useReducedMotion();
  // "paused" remembers whether the slideshow has stopped advancing on its own. It starts paused
  // for visitors who have turned on "reduce motion" in their device settings.
  const [paused, setPaused] = useState<boolean>(!!prefersReducedMotion);

  // The automatic slide advance. "useEffect" is React's way to run a job after the page is drawn.
  // Here the job is a timer that moves to the next slide every 6 seconds (6000 milliseconds),
  // wrapping from the last slide back to the first. If the slideshow is paused, or the visitor
  // prefers reduced motion, no timer is started. The "return" line stops the old timer whenever
  // things change, so two timers never run at the same time.
  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [paused, prefersReducedMotion]);

  // Pick out the slide that is showing right now, so the text below can use its words.
  const slide = heroSlides[active];

  // What the visitor sees. Hovering the mouse over the slideshow pauses it (so people can read),
  // and moving the mouse away starts it again.
  return (
    <section
      className="relative h-[100vh] min-h-[620px] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Dark navy backdrop — shows through gaps and sets the base tone
          while images are loading. */}
      <div className="absolute inset-0 bg-pomfret-navy" />

      {/* Slide backgrounds — each slide cross-fades an authentic Pomfret
          photograph with a slow Ken Burns zoom for archival cinematic feel.
          Reduced-motion users get a static image, no zoom, no cross-fade. */}
      {/* All four photos are stacked in one spot; only the active one is fully visible. */}
      {heroSlides.map((s, i) => (
        <m.div
          key={s.id}
          initial={false}
          animate={{
            opacity: i === active ? 1 : 0,
            scale: prefersReducedMotion ? 1 : i === active ? 1.06 : 1,
          }}
          transition={{
            opacity: { duration: prefersReducedMotion ? 0 : 0.9, ease: 'easeInOut' },
            scale: { duration: prefersReducedMotion ? 0 : 9, ease: 'linear' },
          }}
          className="absolute inset-0"
          aria-hidden={i !== active}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: s.imagePosition }}
          />
        </m.div>
      ))}

      {/* Legibility scrim — a single universal dark layer shared across all
          slides. Neutral (no color tint) so it doesn't muddy the photograph:
          just a soft overall darken with a stronger wash at the top and
          bottom edges where the nav and caption sit. */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Pomfret architectural motif — a subtle arched-window silhouette
          that evokes the Gothic Revival buildings on the Hilltop (School
          House, Clark Memorial Chapel). Sits just above the indicators. */}
      <svg
        className="absolute left-1/2 -translate-x-1/2 bottom-32 w-[min(520px,70vw)] h-12 text-warm-white/15 pointer-events-none"
        viewBox="0 0 520 48"
        fill="none"
        aria-hidden="true"
      >
        {/* Three Gothic-style arches separated by slim pilasters — stylized */}
        <path
          d="M10 48 V18 Q10 4 30 4 T50 18 V48 M90 48 V14 Q90 0 110 0 T130 14 V48 M170 48 V10 Q170 -4 190 -4 T210 10 V48"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M310 48 V10 Q310 -4 330 -4 T350 10 V48 M390 48 V14 Q390 0 410 0 T430 14 V48 M470 48 V18 Q470 4 490 4 T510 18 V48"
          stroke="currentColor"
          strokeWidth="1"
        />
        <line x1="260" y1="8" x2="260" y2="48" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="260" cy="4" r="2.5" stroke="currentColor" strokeWidth="0.75" />
      </svg>

      {/* Carousel navigation arrows */}
      {/* Left arrow: go back one slide (from the first slide it wraps around to the last). */}
      <button
        onClick={() => setActive((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-warm-white/30 text-warm-white/70 hover:text-warm-white hover:border-warm-white hover:bg-warm-white/10 transition-all flex items-center justify-center z-20"
        aria-label="Previous slide"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {/* Right arrow: go forward one slide (from the last slide it wraps back to the first). */}
      <button
        onClick={() => setActive((i) => (i + 1) % heroSlides.length)}
        className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-warm-white/30 text-warm-white/70 hover:text-warm-white hover:border-warm-white hover:bg-warm-white/10 transition-all flex items-center justify-center z-20"
        aria-label="Next slide"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Centered headline — swaps with slide */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        {/* Small "Est. 1894" line. Its "key" changes with each slide, so React treats it */}
        {/* as brand new and its fade-up animation replays every time the slide changes. */}
        <m.div
          key={`kicker-${slide.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-px bg-maroon-light" />
            <span className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-warm-white/90">
              Est. 1894 &middot; Pomfret, Connecticut
            </span>
            <div className="w-12 h-px bg-maroon-light" />
          </div>
        </m.div>

        {/* The big headline, with the slide's "accent" words on a second line in italics. */}
        <m.h1
          key={`headline-${slide.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] text-warm-white mb-6"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {slide.headline}
          <br />
          <span className="italic font-normal">{slide.accent}</span>
        </m.h1>

        {/* The slide's subtitle, fading in a moment after the headline. */}
        <m.p
          key={`subtitle-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg lg:text-xl text-warm-white/90 max-w-2xl mx-auto font-body font-light"
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
        >
          {slide.subtitle}
        </m.p>
      </div>

      {/* Image credit / caption — small archival-style attribution that
          changes with each slide. Sits above the indicators bottom-left. */}
      <m.div
        key={`caption-${slide.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute bottom-10 left-6 lg:left-12 z-20 max-w-xs hidden sm:block"
      >
        <div className="flex items-center gap-2 text-[10px] font-body tracking-[0.2em] uppercase text-warm-white/60">
          <span className="w-6 h-px bg-warm-white/40" />
          <span>From the Archive</span>
        </div>
        <p className="mt-2 text-xs font-body text-warm-white/75 italic leading-snug">
          {slide.caption}
        </p>
      </m.div>

      {/* Play/Pause control */}
      {/* Clicking flips between paused and playing, and swaps the icon to match. */}
      <button
        onClick={() => setPaused((p) => !p)}
        className="absolute bottom-8 right-8 lg:right-12 z-20 w-11 h-11 rounded-full border border-warm-white/30 text-warm-white/70 hover:text-warm-white hover:border-warm-white transition-all flex items-center justify-center"
        aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
      >
        {paused ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 2v8l7-4-7-4z" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="1" y="1" width="3" height="8" />
            <rect x="6" y="1" width="3" height="8" />
          </svg>
        )}
      </button>

      {/* Carousel indicators */}
      {/* One small bar per slide; clicking a bar jumps straight to that slide. */}
      {/* The bar for the slide on screen is drawn longer and brighter. */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="relative flex items-center justify-center min-w-[44px] min-h-[44px] group"
          >
            <span
              className={`block transition-all h-0.5 ${
                i === active ? 'w-10 bg-warm-white' : 'w-2 bg-warm-white/40 group-hover:bg-warm-white/70'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

// =================================================================
// SECTION 2: MISSION STATEMENT — Centered single-column text
// =================================================================
// MissionSection shows the "Our Mission" statement: a centered heading and two paragraphs
// about what "VOICES" means and how Pomfret's community has widened since 1894. Its only
// movement is fading in (through ScrollReveal) when the visitor scrolls down to it.
function MissionSection() {
  return (
    <section className="py-20 lg:py-28 bg-warm-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <ScrollReveal>
          {/* A small "Our Mission" label, then the large heading about amplifying VOICES. */}
          <div className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-maroon mb-6">
            Our Mission
          </div>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] text-navy mb-6">
            <span className="font-bold">A school&apos;s truest measure</span>{' '}
            <span className="font-normal text-pomfret-gray">
              is not the stories it tells about itself, but the{' '}
              <span className="font-bold tracking-[0.04em] text-maroon">VOICES</span>{' '}
              it chooses to amplify.
            </span>
          </h2>
          <div className="w-12 h-0.5 bg-maroon mx-auto mb-6" />
          {/* Two paragraphs explaining the word VOICES and the arc of Pomfret's history. */}
          <p className="text-sm text-slate/80 font-body leading-relaxed max-w-xl mx-auto mb-5">
            <span className="font-semibold text-navy">VOICES</span> appears here with intention:
            it points to Pomfret&apos;s VOICE program and to the student voices that continue to
            shape the school.
          </p>
          <p className="text-base text-slate font-body leading-relaxed max-w-2xl mx-auto">
            Founded in 1894 as an all-boys school, Pomfret&apos;s history has widened across
            generations: girls joined classrooms and boarding life, international students
            expanded the school&apos;s perspective, and today&apos;s student body reflects a broader
            range of racial, cultural, and lived experiences than ever before. With Heather
            Willis Daly now serving as Pomfret&apos;s first female Head of School, this archive
            traces the choices, students, and VOICES that continue to move the Hilltop toward
            belonging.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// =================================================================
// SECTION 3: SIGNATURE EXHIBITS — 4-column card grid with images
// =================================================================
// SignatureExhibits shows a row of five clickable cards, one for each main part of the site
// (timeline, profiles, magazines, campus tour, AI bias). Clicking a card opens that page.
function SignatureExhibits() {
  // The five exhibit cards. Each has the page it links to, a small category label, a title,
  // a one-line summary ("meta"), and a short description.
  const exhibits = [
    {
      href: '/timeline',
      category: 'Interactive',
      title: 'The DEI Timeline',
      meta: '130 Years · 31 Events',
      description: 'From founding in 1894 to today — explore the milestones that shaped diversity at Pomfret.',
    },
    {
      href: '/humans-of-pomfret',
      category: 'Portraits',
      title: 'Humans of Pomfret',
      meta: 'Students · Alumni · Faculty',
      description: 'Short, powerful profiles celebrating the people who make this community extraordinary.',
    },
    {
      href: '/archive',
      category: 'Magazines',
      title: 'Magazine Archive',
      meta: '2 Issues · 41 Pages',
      description: 'Original Pomfret Magazine issues preserving the school\'s DEI history in its own voice.',
    },
    {
      href: '/tour',
      category: 'Campus',
      title: 'Campus Overview',
      meta: 'Aerial · Then / Now',
      description: 'A wide-angle view of the Hilltop, showing campus scale and change without entering private spaces.',
    },
    {
      href: '/ai-bias',
      category: 'Ethics',
      title: 'AI Bias Awareness',
      meta: 'Education · Transparency',
      description: 'How AI perpetuates bias in representation — and what Pomfret is doing about it.',
    },
  ];

  // Draw the section heading, then one card per exhibit.
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="mb-16">
            <SectionHeading bold="Signature" rest="Exhibits" />
            <p className="mt-4 text-base text-slate font-body max-w-2xl">
              Five interconnected archives, exhibits, and educational modules that make the living archive.
            </p>
          </div>
        </ScrollReveal>

        {/* The grid of cards. Each card fades in slightly after the one before it. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-navy/10 rounded-sm overflow-hidden border border-navy/10">
          {exhibits.map((exhibit, i) => (
            <ScrollReveal key={exhibit.href} delay={i * 0.08}>
              {/* The whole card is one link to the exhibit's page. */}
              <Link
                href={exhibit.href}
                className="group flex flex-col h-full bg-cream hover:bg-warm-white transition-colors duration-300 p-6 lg:p-7 min-h-[280px]"
              >
                {/* Category tag + number */}
                <div className="flex items-baseline justify-between mb-8">
                  <span className="text-[10px] font-body tracking-[0.25em] uppercase text-maroon font-semibold">
                    {exhibit.category}
                  </span>
                  {/* Card number, such as "01 / 05" (a leading zero is added to single digits). */}
                  <span className="font-display text-xs text-navy/30 tabular-nums">
                    {String(i + 1).padStart(2, '0')} / {String(exhibits.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl lg:text-[1.6rem] text-navy mb-3 group-hover:text-maroon transition-colors leading-[1.15]">
                  {exhibit.title}
                </h3>

                {/* One-line summary, such as "130 Years · 31 Events". */}
                <div className="text-[11px] font-body text-slate/70 uppercase tracking-wider mb-4">
                  {exhibit.meta}
                </div>

                <p className="text-sm text-slate font-body leading-relaxed mb-6 flex-1">
                  {exhibit.description}
                </p>

                {/* Arrow CTA */}
                <span className="inline-flex items-center gap-2 text-sm font-body font-semibold text-maroon group-hover:gap-3 transition-all mt-auto">
                  Explore
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// SECTION 4: REMARKABLE VOICES — editorial portrait cards
// =================================================================
// Each voice gets one of two card treatments:
//   • photo card — real archival/contemporary portrait + brand wash
//   • monogram card — large display-font initials on a tinted brand
//     surface; intentional typography, NOT a missing-photo placeholder
// Cards link to the relevant timeline event or profile so the section
// is a real entry point rather than decoration.
// "type Voice" below is a checklist of the details each voice card needs. It does not show
// anything on the page; it just lets the code editor catch typos and missing details.
type Voice = {
  name: string;
  year: string;
  role: string;
  quote: string;
  href: string;
  // When present, renders the photo card variant.
  image?: string;
  imagePosition?: string;
  // Color rotation for monogram cards: alternates navy / maroon / cream.
  tone?: 'navy' | 'maroon' | 'cream';
};

// The six voices shown on the homepage. Only one has a photo here; the rest use the lettered
// (monogram) card design. Each card links to a profile page or to the timeline.
const voices: Voice[] = [
  {
    name: 'John Irick',
    year: '\u201965',
    role: 'First African American graduate',
    quote: 'For me, Pomfret was a dream come true.',
    href: '/humans-of-pomfret/john-irick',
    tone: 'navy',
  },
  {
    name: 'Naomi Vega',
    year: '\u201969',
    role: 'First female graduate',
    quote: 'It was a time of major upheaval in the country.',
    href: '/humans-of-pomfret/naomi-vega',
    tone: 'maroon',
  },
  {
    name: 'Michael Gary',
    year: '\u201982',
    role: 'First Director of Multicultural Affairs',
    quote: 'The best decision of my life.',
    href: '/timeline',
    tone: 'cream',
  },
  {
    name: 'Heather Willis Daly',
    year: '2025',
    role: 'First female Head of School',
    quote: 'The Pomfret we are becoming.',
    href: '/humans-of-pomfret/heads-of-school',
    image: '/heads/heather-willis-daly.jpg',
    imagePosition: '50% 25%',
  },
  {
    name: 'Dr. Coretta McCarter',
    year: 'Today',
    role: 'Dean of Diversity, Equity & Inclusion',
    quote: 'A day on for justice.',
    href: '/timeline',
    tone: 'navy',
  },
  {
    name: 'VOICE',
    year: '1984',
    role: 'Multicultural student leadership',
    quote: 'To make a voice \u2014 in all capital letters.',
    href: '/timeline',
    tone: 'maroon',
  },
];

// VoiceCard draws one card in the Remarkable Voices row. It is given one voice, its place in
// the list, and how many voices there are (for the "01 / 06" counter). It hands back a card
// that links to that person's profile or to the timeline.
function VoiceCard({ voice, index, total }: { voice: Voice; index: number; total: number }) {
  // Build the monogram from the first two name tokens, stripping titles.
  const initials = voice.name
    // Drop titles like "Dr." first, so the letters come from the person's actual name.
    .replace(/^(Dr\.|Lt\. Col\.|The Honorable) /, '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  // Photo variant — portrait fills the card under a brand wash. Used when
  // we have a real, consented photo (e.g. Heather Willis Daly).
  if (voice.image) {
    return (
      <Link
        href={voice.href}
        className="group relative block aspect-[3/4] rounded-2xl overflow-hidden bg-pomfret-navy"
      >
        {/* The portrait photo, which zooms in slightly when the mouse hovers over the card. */}
        <Image
          src={voice.image}
          alt={`Portrait of ${voice.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition: voice.imagePosition ?? '50% 30%' }}
        />
        {/* A dark fade from the bottom so the white name text stays readable over the photo. */}
        <div className="absolute inset-0 bg-gradient-to-t from-pomfret-navy/95 via-pomfret-navy/40 to-transparent" />
        {/* Counter in the top corner, such as "04 / 06". */}
        <span className="absolute top-4 right-4 text-[10px] font-body tabular-nums text-warm-white/50">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        {/* Year, name, and role along the bottom of the card. */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="text-[10px] font-body font-bold tracking-[0.25em] uppercase text-maroon-light mb-2">
            {voice.year}
          </div>
          <h4 className="font-display text-lg lg:text-xl text-warm-white leading-tight mb-1">
            {voice.name}
          </h4>
          <p className="text-[11px] text-warm-white/70 font-body leading-snug">{voice.role}</p>
        </div>
      </Link>
    );
  }

  // Monogram variant — large display-font initials on a brand surface.
  // Hovering reveals the quote in an overlay panel.
  // Pick the card's colors from its "tone": cream cards get dark text, while navy and maroon
  // cards get light text. These are only styling choices.
  const tone = voice.tone ?? 'navy';
  const surface =
    tone === 'cream'
      ? 'bg-cream text-navy border-mist'
      : tone === 'maroon'
      ? 'bg-maroon text-warm-white border-maroon'
      : 'bg-pomfret-navy text-warm-white border-pomfret-navy';
  const counterColor = tone === 'cream' ? 'text-navy/30' : 'text-warm-white/40';
  const yearColor = tone === 'cream' ? 'text-maroon' : 'text-maroon-light';
  const monogramColor = tone === 'cream' ? 'text-navy/15' : 'text-warm-white/15';
  const subtleColor = tone === 'cream' ? 'text-slate' : 'text-warm-white/70';

  return (
    <Link
      href={voice.href}
      className={`group relative block aspect-[3/4] rounded-2xl overflow-hidden border ${surface} flex flex-col justify-between p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
    >
      {/* Year tag (top-left) + index counter (top-right) */}
      <div className={`text-[10px] font-body font-bold tracking-[0.25em] uppercase ${yearColor}`}>
        {voice.year}
      </div>
      <span className={`absolute top-5 right-5 text-[10px] font-body tabular-nums ${counterColor}`}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>

      {/* Large monogram, vertically centered */}
      <div className="flex-1 flex items-center justify-center">
        <span className={`font-display text-[clamp(3.5rem,5vw,5rem)] leading-none ${monogramColor}`}>
          {initials}
        </span>
      </div>

      {/* Name + role (bottom) */}
      <div>
        <h4 className="font-display text-lg lg:text-xl leading-tight mb-1">{voice.name}</h4>
        <p className={`text-[11px] font-body leading-snug ${subtleColor}`}>{voice.role}</p>
      </div>

      {/* Hover-revealed quote panel — full-card overlay */}
      <div className="absolute inset-0 bg-pomfret-navy text-warm-white p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between pointer-events-none">
        <div className="text-[10px] font-body font-bold tracking-[0.25em] uppercase text-maroon-light">
          {voice.year}
        </div>
        <blockquote className="font-display text-base lg:text-lg italic leading-snug">
          &ldquo;{voice.quote}&rdquo;
        </blockquote>
        <div>
          <h4 className="font-display text-lg leading-tight mb-1">{voice.name}</h4>
          <p className="text-[11px] font-body text-warm-white/70 leading-snug">{voice.role}</p>
        </div>
      </div>
    </Link>
  );
}

// RemarkableVoices builds the whole "Remarkable Voices" section: a heading, a short intro,
// an "All Profiles" link to the Humans of Pomfret page, and a row of six VoiceCards.
function RemarkableVoices() {
  return (
    <section className="py-24 lg:py-32 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <SectionHeading bold="Remarkable" rest="Voices" />
              <p className="mt-4 text-base text-slate font-body">
                Six pivotal figures whose stories anchor the Pomfret DEI archive &mdash;
                from the first African American graduate in 1965 to today&rsquo;s Dean of DEI.
              </p>
            </div>
            {/* Link to the full Humans of Pomfret profiles page. */}
            <Link
              href="/humans-of-pomfret"
              className="text-[11px] font-body font-bold tracking-[0.15em] uppercase text-maroon hover:text-maroon-dark inline-flex items-center gap-2 self-start lg:self-auto"
            >
              All Profiles
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        {/* The row of six cards, each fading in a little after the previous one. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {voices.map((voice, i) => (
            <ScrollReveal key={voice.name} delay={i * 0.08}>
              <VoiceCard voice={voice} index={i} total={voices.length} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// SECTION 5: LATEST STORIES — Blog feed style
// =================================================================
// LatestStories shows three short news-style story previews (category, author, date, title,
// and a one-sentence summary). The "View All Stories" link goes to the timeline page.
// The previews change color when hovered, but they are not links: clicking one does nothing.
function LatestStories() {
  // The three stories, typed in by hand.
  const stories = [
    {
      category: 'Milestone',
      author: 'The Archive',
      date: 'January 21, 2026',
      title: 'A Day On for Justice: MLK Programming Brings Community Together',
      excerpt: 'Dr. Coretta McCarter led a full day of student workshops on civil rights, policy, and social justice.',
    },
    {
      category: 'Leadership',
      author: 'Pomfret School',
      date: 'October 1, 2024',
      title: 'First Female Head of School Appointed in 130-Year History',
      excerpt: 'Heather Willis Daly becomes the 13th Head of School — and the first woman to hold the role.',
    },
    {
      category: 'Student Voices',
      author: 'The Archive',
      date: 'June 1, 2020',
      title: '@BlackAtPomfret: When Students Told Their Stories',
      excerpt: 'How the racial reckoning of 2020 reshaped Pomfret\'s approach to accountability and inclusion.',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
            <SectionHeading bold="Pomfret" rest="Stories" />
            {/* "View All Stories" link, which currently goes to the timeline page. */}
            <Link href="/timeline" className="text-[11px] font-body font-bold tracking-[0.15em] uppercase text-maroon hover:text-maroon-dark inline-flex items-center gap-2">
              View All Stories
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        {/* The three story previews side by side (stacked on narrow phone screens). */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {stories.map((story, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <article className="group cursor-pointer border-t border-mist pt-6">
                <div className="flex items-center gap-3 text-xs font-body text-slate/70 uppercase tracking-wider mb-3 flex-wrap">
                  <span className="text-maroon font-semibold">{story.category}</span>
                  <span>&middot;</span>
                  <span>{story.author}</span>
                  <span>&middot;</span>
                  <span>{story.date}</span>
                </div>
                <h3 className="font-display text-2xl text-navy mb-3 group-hover:text-maroon transition-colors leading-tight">
                  {story.title}
                </h3>
                <p className="text-slate font-body leading-relaxed">
                  {story.excerpt}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// HOMEPAGE
// =================================================================
// Home is the page itself. Next.js shows whatever this "default export" hands back when
// someone visits the site's main address. It simply stacks the five sections in order.
export default function Home() {
  return (
    <>
      {/* The empty "<> </>" wrapper groups the sections without adding an extra box. */}
      <HeroSection />
      <MissionSection />
      <SignatureExhibits />
      <RemarkableVoices />
      <LatestStories />
    </>
  );
}
