import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseDate, formatReservationDate, isValidDateString, getTimeBasedGreeting } from "./dates";

describe("parseDate", () => {
  it("should parse ISO format YYYY-MM-DD", () => {
    const result = parseDate("2026-03-09");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(2); // March is 2 (0-indexed)
    expect(result?.getDate()).toBe(9);
  });

  it("should parse ISO format with time", () => {
    const result = parseDate("2026-03-09T15:30:00");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getHours()).toBe(15);
  });

  it("should parse DD MMM YYYY format (Spanish)", () => {
    const result = parseDate("09 mar 2026");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(2);
    expect(result?.getDate()).toBe(9);
  });

  it("should parse DD MMM YYYY format (English)", () => {
    const result = parseDate("09 jan 2026");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getMonth()).toBe(0);
  });

  it("should handle all Spanish month abbreviations", () => {
    const months = [
      { input: "01 ene 2026", expected: 0 },
      { input: "01 feb 2026", expected: 1 },
      { input: "01 mar 2026", expected: 2 },
      { input: "01 abr 2026", expected: 3 },
      { input: "01 may 2026", expected: 4 },
      { input: "01 jun 2026", expected: 5 },
      { input: "01 jul 2026", expected: 6 },
      { input: "01 ago 2026", expected: 7 },
      { input: "01 sep 2026", expected: 8 },
      { input: "01 oct 2026", expected: 9 },
      { input: "01 nov 2026", expected: 10 },
      { input: "01 dic 2026", expected: 11 },
    ];

    months.forEach(({ input, expected }) => {
      const result = parseDate(input);
      expect(result?.getMonth()).toBe(expected);
    });
  });

  it("should return null for invalid date strings", () => {
    expect(parseDate("")).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate("invalid-date")).toBeNull();
    expect(parseDate("not a date")).toBeNull();
    expect(parseDate("abc def ghi")).toBeNull();
  });

  it("should handle null and undefined", () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
  });
});

describe("isValidDateString", () => {
  it("should return true for valid dates", () => {
    expect(isValidDateString("2026-03-09")).toBe(true);
    expect(isValidDateString("09 mar 2026")).toBe(true);
  });

  it("should return false for invalid dates", () => {
    expect(isValidDateString("")).toBe(false);
    expect(isValidDateString(null)).toBe(false);
    expect(isValidDateString(undefined)).toBe(false);
    expect(isValidDateString("invalid")).toBe(false);
  });
});

describe("formatReservationDate", () => {
  it("should format ISO date correctly", () => {
    const result = formatReservationDate("2026-03-09");
    expect(result).toMatch(/9\s+mar\s+2026/i);
  });

  it("should format DD MMM YYYY date correctly", () => {
    const result = formatReservationDate("09 mar 2026");
    expect(result).toMatch(/9\s+mar\s+2026/i);
  });

  it("should return 'Fecha inválida' for invalid dates", () => {
    expect(formatReservationDate("")).toBe("Fecha inválida");
    expect(formatReservationDate(null)).toBe("Fecha inválida");
    expect(formatReservationDate(undefined)).toBe("Fecha inválida");
    expect(formatReservationDate("invalid")).toBe("Fecha inválida");
  });
});

describe("getTimeBasedGreeting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'Buenos días' for morning hours (5-11)", () => {
    for (let hour = 5; hour < 12; hour++) {
      expect(getTimeBasedGreeting(hour)).toBe("Buenos días");
    }
  });

  it("should return 'Buenas tardes' for afternoon hours (12-18)", () => {
    for (let hour = 12; hour < 19; hour++) {
      expect(getTimeBasedGreeting(hour)).toBe("Buenas tardes");
    }
  });

  it("should return 'Buenas noches' for evening/night hours (19-4)", () => {
    for (let hour = 19; hour < 24; hour++) {
      expect(getTimeBasedGreeting(hour)).toBe("Buenas noches");
    }
    for (let hour = 0; hour < 5; hour++) {
      expect(getTimeBasedGreeting(hour)).toBe("Buenas noches");
    }
  });

  it("should use current hour when no parameter provided", () => {
    const mockDate = new Date("2026-03-09T10:00:00");
    vi.setSystemTime(mockDate);
    expect(getTimeBasedGreeting()).toBe("Buenos días");
  });
});

