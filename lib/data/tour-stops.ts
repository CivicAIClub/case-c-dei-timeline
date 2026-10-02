// Shared data source for Campus Tour stops.
// Consumed by both the index page and the dynamic [locationSlug] detail page.
// Stop content is bilingual (English/Spanish) per the original spec; additional
// languages can be added by extending the LocalizedText type.
//
// PLAIN-ENGLISH OVERVIEW
// This file is the list of stops on the campus tour. Each stop is meant to have a QR code
// sign on campus; scanning it opens that stop's page on a phone, where visitors can read
// about the place in English or Spanish.
// Pages that use this list:
//   - /tour/<slug> (app/tour/[locationSlug]/page.tsx and TourStopView.tsx): one page per
//     stop, made automatically for every entry here.
//   - app/sitemap.ts: the list of pages handed to search engines.
//   - /tour (app/tour/TourIndexView.tsx): the overview page, which lists every stop with a
//     link to its page.
//   - the admin QR code maker (app/admin/qr-generator/QRGeneratorView.tsx), which makes one
//     QR code per stop.
// So a stop only needs to be added, removed, or renamed here.
// Once the Sanity content system is connected, this information will move there.

// A piece of text written in two languages: 'en' for English and 'es' for Spanish. Both are
// required. The stop page shows whichever language the visitor picks with the EN / ES
// buttons, and marks the text's language so screen readers pronounce it correctly.
export type LocalizedText = {
  en: string;
  es: string;
};

// The shape every tour stop must follow.
export type TourStop = {
  // A unique ID for this stop (currently just the numbers 1 to 6, written as text).
  _id: string;
  // The end of this stop's web address. For example, 'jahn-rink' gives /tour/jahn-rink. This is
  // the address printed into the QR code, so changing it breaks any signs already printed.
  slug: string;
  // The place's name, shown at the top of the stop's page (the same in both languages).
  locationName: string;
  // One or two sentences shown first, in both languages. The English one is also used as the
  // page's description in search results and link previews.
  quickSummary: LocalizedText;
  // The longer story about the place, in both languages. It stays hidden until the visitor
  // taps to open it.
  deepDive: LocalizedText;
};

// HOW TO ADD A STOP: copy one whole entry (from its "{" line to its "}," line), paste it at
// the end, give it a new _id and a new, unique slug, and fill in the name and both languages
// of text. The /tour page and the QR code maker pick up the new stop on their own.
// HOW TO EDIT: change the text inside the quote marks. If the text contains the same quote
// mark that wraps it, put a backslash (\) in front of it. Keep the English and Spanish saying
// the same thing. (Right now every Spanish "deepDive" leaves out some of the English text.)
export const tourStops: TourStop[] = [
  {
    _id: '1',
    slug: 'clark-memorial-chapel',
    locationName: 'Clark Memorial Chapel',
    quickSummary: {
      en:
        'The heart of community life at Pomfret since 1910. This is where generations of students have shared their stories through the chapel talk tradition.',
      es:
        'El corazón de la vida comunitaria en Pomfret desde 1910. Aquí, generaciones de estudiantes han compartido sus historias a través de la tradición de charlas en la capilla.',
    },
    deepDive: {
      en:
        "Clark Memorial Chapel has stood at the center of Pomfret School since 1910, when it was built as a gift from the Clark family. More than a place of worship, it has always been a place of gathering, reflection, and courage. The chapel talk tradition, where students stand before the entire school community to share their personal stories, began here in the 1930s. Over the decades, these talks have become some of the most powerful moments in students' Pomfret experience — moments where vulnerability becomes strength and individual stories become shared understanding.",
      es:
        'La Capilla Conmemorativa Clark ha estado en el centro de la Escuela Pomfret desde 1910, cuando fue construida como un regalo de la familia Clark. Más que un lugar de culto, siempre ha sido un lugar de reunión, reflexión y coraje.',
    },
  },
  {
    _id: '2',
    slug: 'school-house',
    locationName: 'School House',
    quickSummary: {
      en:
        'The original academic building, now housing the humanities department. Its walls have witnessed over a century of learning and growth.',
      es:
        'El edificio académico original, que ahora alberga el departamento de humanidades. Sus paredes han sido testigos de más de un siglo de aprendizaje y crecimiento.',
    },
    deepDive: {
      en:
        'School House opened with Pomfret in 1894 as the original academic building. Today it houses the humanities department, where English, history, and language classes still meet in rooms that have seen more than a century of students. The building represents the through-line of Pomfret\'s academic mission: that teaching and learning are at the core of what the community does together.',
      es:
        'School House abrió con Pomfret en 1894 como el edificio académico original. Hoy alberga el departamento de humanidades, donde las clases de inglés, historia e idiomas todavía se reúnen en aulas que han visto a más de un siglo de estudiantes.',
    },
  },
  {
    _id: '3',
    slug: 'centennial-garden',
    locationName: 'Centennial Garden',
    quickSummary: {
      en:
        "Created in 1994 to celebrate Pomfret's 100th anniversary. A gathering space designed to reflect the school's evolving identity.",
      es:
        'Creado en 1994 para celebrar el centenario de Pomfret. Un espacio de encuentro diseñado para reflejar la identidad en evolución de la escuela.',
    },
    deepDive: {
      en:
        "The Centennial Garden was created in 1994 to mark Pomfret's first 100 years. A gathering space at the heart of campus, it serves as a place for reflection and conversation — a physical reminder that community is built in the quiet moments between classes, rehearsals, and games.",
      es:
        'El Jardín del Centenario fue creado en 1994 para conmemorar los primeros 100 años de Pomfret. Un espacio de encuentro en el corazón del campus, sirve como lugar de reflexión y conversación.',
    },
  },
  {
    _id: '4',
    slug: 'jahn-rink',
    locationName: 'Jahn Rink',
    quickSummary: {
      en:
        'More than an athletic facility — a place where teamwork transcends differences and community is forged through shared effort.',
      es:
        'Más que una instalación atlética: un lugar donde el trabajo en equipo trasciende las diferencias y la comunidad se forja a través del esfuerzo compartido.',
    },
    deepDive: {
      en:
        "Jahn Rink is more than a hockey rink — it is where the girls' hockey team, first formed in 1973 with hand-me-down equipment, has built decades of legacy. Coached first by Brad Hastings '68, it represents one of Pomfret's early intentional investments in gender equity in athletics.",
      es:
        'Jahn Rink es más que una pista de hockey: es donde el equipo femenino de hockey, formado por primera vez en 1973 con equipamiento de segunda mano, ha construido décadas de legado.',
    },
  },
  {
    _id: '5',
    slug: 'olmsted-observatory',
    locationName: 'Olmsted Observatory',
    quickSummary: {
      en:
        'Connects students to the cosmos and to the universal human experience of wonder, reminding us we all share the same sky.',
      es:
        'Conecta a los estudiantes con el cosmos y con la experiencia humana universal del asombro, recordándonos que todos compartimos el mismo cielo.',
    },
    deepDive: {
      en:
        "Named in honor of William Beach Olmsted, Pomfret's second headmaster (1897-1929), the observatory is a place where students encounter the scale of the universe. Its mission echoes Pomfret's: bring young people face-to-face with ideas bigger than themselves.",
      es:
        'En honor a William Beach Olmsted, el segundo director de Pomfret (1897-1929), el observatorio es un lugar donde los estudiantes encuentran la escala del universo.',
    },
  },
  {
    _id: '6',
    slug: 'hard-auditorium',
    locationName: 'Hard Auditorium',
    quickSummary: {
      en:
        'The stage where student performances celebrate diverse cultures, traditions, and artistic expressions from around the world.',
      es:
        'El escenario donde las actuaciones estudiantiles celebran diversas culturas, tradiciones y expresiones artísticas de todo el mundo.',
    },
    deepDive: {
      en:
        "Hard Auditorium is the stage for Pomfret's public moments — from the annual Cultural Extravaganza (launched in 1996 by Michael Gary '82 and Trina Gary) to VOICE events, chapel alternatives, and theatrical productions. It is where the community sees itself in all its diversity.",
      es:
        'Hard Auditorium es el escenario para los momentos públicos de Pomfret, desde la Extravaganza Cultural anual (lanzada en 1996 por Michael Gary \'82 y Trina Gary) hasta los eventos de VOICE, alternativas de capilla y producciones teatrales.',
    },
  },
];

// Find one stop by its slug. Used by the stop's page. Gives back that stop, or nothing if no
// stop has that slug (the page then shows "not found").
export function getTourStopBySlug(slug: string): TourStop | undefined {
  return tourStops.find((s) => s.slug === slug);
}
