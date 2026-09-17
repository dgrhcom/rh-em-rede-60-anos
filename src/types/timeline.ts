export interface MilestonePhoto {
  id: string;
  title: string;
  caption: string;
  url?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  credit?: string;
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
