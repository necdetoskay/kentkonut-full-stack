export const PlayMode = {
  MANUAL: "MANUAL",
  AUTO: "AUTO",
} as const;

export const AnimationType = {
  FADE: "FADE",
  SLIDE: "SLIDE",
  ZOOM: "ZOOM",
} as const;

export const DEFAULT_BANNER_WIDTH = 1920;
export const DEFAULT_BANNER_HEIGHT = 1080;
export const DEFAULT_DISPLAY_DURATION = 5000; // milliseconds
export const DEFAULT_TRANSITION_DURATION = 0.5; // seconds

// Prisma enum değerlerini TypeScript tipi olarak tanımla
export type PrismaPlayMode = "MANUAL" | "AUTO";
export type PrismaAnimationType = "FADE" | "SLIDE" | "ZOOM"; 