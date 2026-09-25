export interface MilestonePhoto {
  id: string;
  title: string;
  caption: string;
  url?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  credit?: string;
  objectPosition?: 'top' | 'center' | 'bottom';
  objectFit?: 'contain' | 'cover';
}

export const isTopAlignedPhoto = (
  photoOrUrl?: { url?: string; title?: string; credit?: string; caption?: string; objectPosition?: string } | string | null,
  title?: string,
  credit?: string
): boolean => {
  if (!photoOrUrl) return false;
  if (typeof photoOrUrl === 'object') {
    if (photoOrUrl.objectPosition === 'top') return true;
    return /jornal|imprensa|not[ií]cia|manchete|1989_1|1993_1|2001_1|2011_1/i.test(
      `${photoOrUrl.url || ''} ${photoOrUrl.title || ''} ${photoOrUrl.credit || ''} ${photoOrUrl.caption || ''}`
    );
  }
  return /jornal|imprensa|not[ií]cia|manchete|1989_1|1993_1|2001_1|2011_1/i.test(
    `${photoOrUrl} ${title || ''} ${credit || ''}`
  );
};

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
