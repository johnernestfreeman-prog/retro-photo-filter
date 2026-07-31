export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface GradingOptions {
  brightness: number; // multiplier, e.g. 1.35
  desaturation: number; // 0-1, how much you want greyscale
}

export const DEFAULT_GRADING_OPTIONS: GradingOptions = {
  brightness: 1.35,
  desaturation: 0.1,
};

const SHADOW_TINT: RGB = { r: 0.85, g: 0.75, b: 1.05 };
const HIGHLIGHT_TINT: RGB = { r: 1.15, g: 1.0, b: 0.95 };

function luma(color: RGB): number {
  return (color.r * 0.299 + color.g * 0.587 + color.b * 0.114) / 255;
}

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, value));
}

export function applyRetroGrading(
  color: RGB,
  options: GradingOptions = DEFAULT_GRADING_OPTIONS
): RGB {
  const brightness = luma(color);

  const tinted: RGB = {
    r: color.r * (SHADOW_TINT.r + (HIGHLIGHT_TINT.r - SHADOW_TINT.r) * brightness),
    g: color.g * (SHADOW_TINT.g + (HIGHLIGHT_TINT.g - SHADOW_TINT.g) * brightness),
    b: color.b * (SHADOW_TINT.b + (HIGHLIGHT_TINT.b - SHADOW_TINT.b) * brightness),
  };

  const boosted: RGB = {
    r: tinted.r * options.brightness,
    g: tinted.g * options.brightness,
    b: tinted.b * options.brightness,
  };

  const gray = boosted.r * 0.299 + boosted.g * 0.587 + boosted.b * 0.114;
  const desaturated: RGB = {
    r: boosted.r + (gray - boosted.r) * options.desaturation,
    g: boosted.g + (gray - boosted.g) * options.desaturation,
    b: boosted.b + (gray - boosted.b) * options.desaturation,
  };

  return {
    r: clamp255(desaturated.r),
    g: clamp255(desaturated.g),
    b: clamp255(desaturated.b),
  };
}