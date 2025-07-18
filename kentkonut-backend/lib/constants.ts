/**
 * Banner grubu oynatma modları
 */
export const PLAY_MODES = {
  MANUAL: "MANUAL",
  AUTO: "AUTO",
} as const;

export type PlayMode = keyof typeof PLAY_MODES;

/**
 * Banner grubu animasyon tipleri
 */
export const ANIMATION_TYPES = {
  FADE: "FADE",
  SLIDE: "SLIDE",
  ZOOM: "ZOOM",
} as const;

export type AnimationType = keyof typeof ANIMATION_TYPES;

/**
 * Banner grubu durumları
 */
export const STATUS_TYPES = {
  ACTIVE: "active",
  PASSIVE: "passive",
} as const;

export type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES];
