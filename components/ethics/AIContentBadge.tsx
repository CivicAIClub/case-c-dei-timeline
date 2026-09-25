// PLAIN-ENGLISH OVERVIEW
// A small rounded label that reads "AI-Generated Content", with a little "!" warning icon.
// Clicking it takes the visitor to the AI & Bias page (/ai-bias), which explains how AI
// tools can carry unfair biases. It is one of the site's honesty guardrails: a way to flag
// content that AI helped make, so visitors know to read it with care.
// Right now it is only used on the AI & Bias page itself (app/ai-bias/AIBiasView.tsx). The
// bias acknowledgment that appears on every page lives in components/layout/Footer.tsx.
// The 'use client' line below means this part runs in the visitor's browser.
'use client';

import Link from 'next/link';

// The options a page can pass in, both optional: extra styling (className) and a size
// ("sm", "md", or "lg").
interface AIContentBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// The badge itself. Given the options above (medium size if none is chosen); gives back the
// clickable label.
export default function AIContentBadge({ className = '', size = 'md' }: AIContentBadgeProps) {
  // Text size and spacing for each of the three sizes.
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  // Build the label as a link to /ai-bias. The aria-label gives screen readers a fuller
  // description than the visible words.
  return (
    <Link
      href="/ai-bias"
      className={`
        inline-flex items-center rounded-full
        bg-amber/10 border border-amber/30
        text-amber-dark hover:bg-amber/20
        transition-colors duration-200
        font-body font-medium
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label="AI-Generated Content - Learn about AI bias"
    >
      {/* The "!" icon inside a circle; it grows with the badge size. aria-hidden keeps screen */}
      {/* readers from announcing it, since it is only decoration. */}
      <svg
        width={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
        height={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
      </svg>
      {/* The words visitors see on the badge. */}
      AI-Generated Content
    </Link>
  );
}
