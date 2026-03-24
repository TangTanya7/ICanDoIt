import { TaskColor } from "@/types";

export const CARD_PALETTE_SEQUENCE = [
  { background: "#FDDEE3", accent: "#D97792" },
  { background: "#FDE6A3", accent: "#BF8A14" },
  { background: "#CFE0FE", accent: "#5B86D6" },
  { background: "#C5E2AA", accent: "#72A843" },
  { background: "#FCD9BB", accent: "#D98D5B" },
  { background: "#C9EFF2", accent: "#4EA8B0" },
  { background: "#DEDDFD", accent: "#8883D8" },
  { background: "#FEE1FD", accent: "#D57FD3" },
] as const;

export function getCardBackgroundColor(index: number): string {
  return CARD_PALETTE_SEQUENCE[index % CARD_PALETTE_SEQUENCE.length].background;
}

export function getCardAccentColor(index: number): string {
  return CARD_PALETTE_SEQUENCE[index % CARD_PALETTE_SEQUENCE.length].accent;
}

export const TASK_COLORS: Record<
  TaskColor,
  { bg: string; text: string; light: string; border: string; block: string; pill: string }
> = {
  coral:  { bg: "#E06262", text: "#FFFFFF", light: "#FFF0F0", border: "#FFB8B8", block: "#F9E6AB", pill: "#FFFFFF" },
  orange: { bg: "#F29E55", text: "#FFFFFF", light: "#FFF4E6", border: "#FFD4A3", block: "#F9E6AB", pill: "#FFFFFF" },
  blue:   { bg: "#5E93DD", text: "#FFFFFF", light: "#EBF3FC", border: "#A3C9F0", block: "#D1DFFA", pill: "#FFFFFF" },
  green:  { bg: "#7DBB46", text: "#FFFFFF", light: "#F0FBE4", border: "#C5EDA0", block: "#CAE1AF", pill: "#FFFFFF" },
  purple: { bg: "#8B6695", text: "#FFFFFF", light: "#F3EFFE", border: "#D4C5FD", block: "#F7DFE8", pill: "#FFFFFF" },
  pink:   { bg: "#D76D9C", text: "#FFFFFF", light: "#FDF0F7", border: "#F9B8D8", block: "#F7DFE8", pill: "#FFFFFF" },
  teal:   { bg: "#5FC9B3", text: "#FFFFFF", light: "#E8FAF8", border: "#A3E8E3", block: "#D1DFFA", pill: "#FFFFFF" },
  yellow: { bg: "#D5A623", text: "#222222", light: "#FFFDE6", border: "#FFE98A", block: "#F9E6AB", pill: "#FFFFFF" },
};

export const DAY_STATUS_COLORS = {
  completed: "#95D847",
  partial: "#FFD93D",
  missed: "#DFE6E9",
  rest: "#DFE6E9",
  pending: "#4A90D9",
  future: "#F0E6D8",
};
