import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDateRange,
  humanizeEnum,
  initialsOf,
  nightsBetween,
  pluralize,
  toIsoDate,
} from './format';
import { slugify } from './slugify';

describe('formatCurrency', () => {
  it('formats INR in the Indian numbering system', () => {
    // 1,24,999 rather than 124,999 — the lakh grouping matters for our market.
    expect(formatCurrency(124999, 'INR')).toContain('1,24,999');
  });

  it('formats USD with the dollar sign', () => {
    expect(formatCurrency(1500, 'USD')).toBe('$1,500');
  });

  it('renders an em dash for null and undefined', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(undefined)).toBe('—');
  });

  it('renders an em dash for NaN rather than "₹NaN"', () => {
    expect(formatCurrency(Number.NaN)).toBe('—');
  });

  it('falls back to a known locale for an unmapped currency', () => {
    expect(formatCurrency(100, 'AED')).toMatch(/100/);
  });
});

describe('humanizeEnum', () => {
  it('converts SCREAMING_SNAKE_CASE to sentence case', () => {
    expect(humanizeEnum('PENDING_PAYMENT')).toBe('Pending payment');
    expect(humanizeEnum('CITY_BREAK')).toBe('City break');
  });

  it('returns an empty string for nullish input', () => {
    expect(humanizeEnum(null)).toBe('');
    expect(humanizeEnum(undefined)).toBe('');
  });
});

describe('initialsOf', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsOf('Priya Sharma')).toBe('PS');
    // First two words, not first + last — keeps the rule predictable.
    expect(initialsOf('Ananya Rao Deshpande')).toBe('AR');
  });

  it('ignores extra whitespace between names', () => {
    expect(initialsOf('  Priya   Sharma  ')).toBe('PS');
  });

  it('handles a single name', () => {
    expect(initialsOf('Vikram')).toBe('V');
  });

  it('falls back to the brand initials when there is no name', () => {
    expect(initialsOf(null)).toBe('GT');
    expect(initialsOf('')).toBe('GT');
  });
});

describe('nightsBetween', () => {
  it('counts calendar nights between two dates', () => {
    expect(nightsBetween('2026-03-12', '2026-03-19')).toBe(7);
  });

  it('returns 0 when the range is inverted rather than a negative count', () => {
    expect(nightsBetween('2026-03-19', '2026-03-12')).toBe(0);
  });

  it('returns 0 for a same-day range', () => {
    expect(nightsBetween('2026-03-12', '2026-03-12')).toBe(0);
  });
});

describe('formatDateRange', () => {
  it('collapses the month when both ends share it', () => {
    expect(formatDateRange('2026-03-12', '2026-03-19')).toBe('12 – 19 Mar 2026');
  });

  it('shows both months when the range spans two', () => {
    expect(formatDateRange('2026-03-28', '2026-04-04')).toBe('28 Mar – 04 Apr 2026');
  });
});

describe('toIsoDate', () => {
  it('formats a Date as the yyyy-MM-dd the backend expects', () => {
    expect(toIsoDate(new Date(2026, 2, 9))).toBe('2026-03-09');
  });
});

describe('pluralize', () => {
  it('uses the singular for exactly one', () => {
    expect(pluralize(1, 'night')).toBe('1 night');
  });

  it('uses the plural otherwise', () => {
    expect(pluralize(3, 'night')).toBe('3 nights');
    expect(pluralize(0, 'night')).toBe('0 nights');
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Bali Honeymoon Escape')).toBe('bali-honeymoon-escape');
  });

  it('strips punctuation and collapses repeats', () => {
    expect(slugify('  Kerala,  Backwaters!! ')).toBe('kerala-backwaters');
  });

  it('removes accents', () => {
    expect(slugify('Curaçao')).toBe('curacao');
  });
});
