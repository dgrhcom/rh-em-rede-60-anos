export interface MilestonePhoto {
  id: string;
  title: string;
  caption: string;
  url?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  credit?: string;
  objectPosition?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  objectFit?: 'contain' | 'cover';
}

export const isBottomAlignedPhoto = (
  photoOrUrl?: { url?: string; title?: string; credit?: string; caption?: string; objectPosition?: string } | string | null,
  title?: string
): boolean => {
  if (!photoOrUrl) return false;
  if (typeof photoOrUrl === 'object') {
    if (photoOrUrl.objectPosition === 'bottom') return true;
    return /2004_3/i.test(`${photoOrUrl.url || ''} ${photoOrUrl.title || ''}`);
  }
  return /2004_3/i.test(`${photoOrUrl} ${title || ''}`);
};

export const getPhotoPositionClass = (photo?: MilestonePhoto | null): string => {
  if (!photo) return 'object-center';
  if (photo.objectPosition === 'left') return 'object-left';
  if (photo.objectPosition === 'right') return 'object-right';
  if (photo.objectPosition === 'bottom' || isBottomAlignedPhoto(photo)) return 'object-bottom';
  if (photo.objectPosition === 'top' || isTopAlignedPhoto(photo)) return 'object-top';
  return 'object-center';
};

export const isTopAlignedPhoto = (
  photoOrUrl?: { url?: string; title?: string; credit?: string; caption?: string; objectPosition?: string } | string | null,
  title?: string,
  credit?: string
): boolean => {
  if (!photoOrUrl) return false;
  if (typeof photoOrUrl === 'object') {
    if (photoOrUrl.objectPosition === 'top') return true;
    if (photoOrUrl.objectPosition === 'bottom') return false;
    return /jornal|imprensa|not[ií]cia|manchete|1989_1|1993_1|2001_1|2003_1|2011_1|1962|diretor/i.test(
      `${photoOrUrl.url || ''} ${photoOrUrl.title || ''} ${photoOrUrl.credit || ''} ${photoOrUrl.caption || ''}`
    );
  }
  return /jornal|imprensa|not[ií]cia|manchete|1989_1|1993_1|2001_1|2003_1|2011_1|1962|diretor/i.test(
    `${photoOrUrl} ${title || ''} ${credit || ''}`
  );
};

export interface DirectorProfile {
  id: string;
  period: string; // e.g. "2017 – 2021"
  director: string; // e.g. "Gilmar Dias da Silva"
  deputy?: string; // e.g. "Milton Guilhen (Adjunto)"
  deputies?: string[]; // e.g. ["Margareth Bazzo (Adjunta 1990-1994)", "Cecília Rampazzo (Adjunta 1995-1998)"]
  photoUrl: string;
  bio?: string;
  role?: string;
}

export interface PeriodMilestone {
  id: string;
  year?: string;
  text: string;
  category?: 'organizacao' | 'informatizacao' | 'carreira' | 'saude' | 'desenvolvimento';
}

export interface HistoricalPeriod {
  id: string;
  index: number;
  period: string; // e.g. "1983 - 1986"
  startYear: number;
  endYear: number;
  title: string; // Theme title
  shortLabel?: string; // Short uppercase kicker like in ten.375.studio
  coverImage: string; // Featured index cover photo
  summary: string; // Short synopsis
  description: string; // Longer context
  milestones: PeriodMilestone[];
  photos: MilestonePhoto[];
  directors?: DirectorProfile[];
  themeColor: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    glow: string;
    cardBg?: string; // DGRH auxiliary light surface color
    cardBorder?: string; // High contrast border color
  };
  iconName: string;
  badge: {
    title: string;
    description: string;
    icon: string;
  };
}

export type ViewMode = 'circle' | 'board' | 'timeline';
