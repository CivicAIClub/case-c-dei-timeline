import type { Metadata } from 'next';
import TimelineView from './TimelineView';

// The page's title and descriptions for search results and link previews. The event count
// (53) and year span (132 years, 1894 to 2026) are typed in by hand, so update them when
// events are added to the demoEvents list in app/timeline/TimelineView.tsx.
export const metadata: Metadata = {
  title: 'The Arc of Inclusion · Timeline',
  description:
    'Interactive horizontal timeline of 53 milestone events in the history of diversity, equity, and inclusion at Pomfret School, from the 1894 founding through present day.',
  alternates: { canonical: '/timeline' },
  openGraph: {
    title: 'The Arc of Inclusion · Pomfret DEI Timeline',
    description:
      '132 years of milestone events — first African American graduate, first female graduate, VOICE founding, and the ongoing work of an inclusive community.',
    type: 'article',
  },
};

export default function TimelinePage() {
  return <TimelineView />;
}
