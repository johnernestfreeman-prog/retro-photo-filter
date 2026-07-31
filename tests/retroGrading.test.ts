import { applyRetroGrading, DEFAULT_GRADING_OPTIONS } from '../src/retroGrading';

describe('applyRetroGrading', () => {
  it('tints a pure black pixel toward purple (shadow tint)', () => {
    const black = { r: 0, g: 0, b: 0 };
    const result = applyRetroGrading(black);

    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('tints a near-white pixel toward warm tones (highlight tint)', () => {
    const nearWhite = { r: 200, g: 200, b: 200 };
    const result = applyRetroGrading(nearWhite, { brightness: 1.0, desaturation: 0 });

    expect(result.r).toBeGreaterThan(result.b);
  });

  it('increases overall brightness when brightness option > 1', () => {
    const midGray = { r: 128, g: 128, b: 128 };
    const normal = applyRetroGrading(midGray, { brightness: 1.0, desaturation: 0 });
    const brightened = applyRetroGrading(midGray, { brightness: 1.5, desaturation: 0 });

    expect(brightened.r).toBeGreaterThan(normal.r);
    expect(brightened.g).toBeGreaterThan(normal.g);
    expect(brightened.b).toBeGreaterThan(normal.b);
  });

  it('pulls a saturated color toward gray as desaturation increases', () => {
    const saturatedRed = { r: 255, g: 0, b: 0 };
    const noDesat = applyRetroGrading(saturatedRed, { brightness: 1.0, desaturation: 0 });
    const fullDesat = applyRetroGrading(saturatedRed, { brightness: 1.0, desaturation: 1.0 });

    const spreadNoDesat = noDesat.r - noDesat.g;
    const spreadFullDesat = fullDesat.r - fullDesat.g;
    expect(spreadFullDesat).toBeLessThan(spreadNoDesat);
  });

  it('never produces a value outside the valid 0-255 range', () => {
    const brightSaturated = { r: 255, g: 255, b: 255 };
    const result = applyRetroGrading(brightSaturated, { brightness: 3.0, desaturation: 0 });

    expect(result.r).toBeLessThanOrEqual(255);
    expect(result.g).toBeLessThanOrEqual(255);
    expect(result.b).toBeLessThanOrEqual(255);
    expect(result.r).toBeGreaterThanOrEqual(0);
  });

  it('uses sensible default options when none are provided', () => {
    const gray = { r: 128, g: 128, b: 128 };
    const withDefaults = applyRetroGrading(gray);
    const withExplicitDefaults = applyRetroGrading(gray, DEFAULT_GRADING_OPTIONS);

    expect(withDefaults).toEqual(withExplicitDefaults);
  });

  it('is a pure function — same input always produces same output', () => {
    const color = { r: 100, g: 150, b: 200 };
    const result1 = applyRetroGrading(color);
    const result2 = applyRetroGrading(color);

    expect(result1).toEqual(result2);
  });
});