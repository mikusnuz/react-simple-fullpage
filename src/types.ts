import { ReactNode } from "react";

export interface FullPageProps {
  children: ReactNode;
  scrollingSpeed?: number;
  showDotsAlways?: boolean;
  dotColor?: string;
  activeDotColor?: string;
  dotSize?: number;
  direction?: "vertical" | "horizontal";
}

export interface SectionProps {
  children: ReactNode;
  className?: string;
}
