export type SectionType = 'top' | 'bottom';

export interface ProgressBlockData {
  id: string;
  name: string;
  color: string; // Tailwind color name like 'blue', 'green', 'red'
  startYear: number;
  startMonth: number; // 1-12
  endYear: number;
  endMonth: number; // 1-12
  section: SectionType;
  row?: number; // Optional row index for manual vertical positioning
}

export interface TimelineDimensions {
  totalMonths: number;
  monthWidth: number;
  timelineWidth: number;
  startMonthAbsIndex: number; // 0-indexed absolute month of timeline start (e.g., 2015*12)
}