import { describe, it, expect } from "vitest";
import { formatDate, getNightsCount, getBookingAdminUrl, isActiveNow } from "./helpers";

describe("formatDate", () => {
  it("should format valid date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("15");
    expect(result).toContain("ene");
  });

  it("should return 'Invalid Date' for invalid date string", () => {
    const result = formatDate("invalid-date");
    // JavaScript's Date converts invalid strings to "Invalid Date"
    expect(result).toBe("Invalid Date");
  });
});

describe("getNightsCount", () => {
  it("should calculate correct number of nights", () => {
    const result = getNightsCount("2024-01-15", "2024-01-20");
    expect(result).toBe(5);
  });

  it("should return 0 for same day", () => {
    const result = getNightsCount("2024-01-15", "2024-01-15");
    expect(result).toBe(0);
  });

  it("should return 0 for invalid dates", () => {
    const result = getNightsCount("invalid", "invalid");
    // getNightsCount now checks for NaN dates and returns 0
    expect(result).toBe(0);
  });

  it("should handle single night stay", () => {
    const result = getNightsCount("2024-01-15", "2024-01-16");
    expect(result).toBe(1);
  });
});

describe("getBookingAdminUrl", () => {
  it("should generate correct Booking.com admin URL", () => {
    const result = getBookingAdminUrl("ABC123");
    expect(result).toBe("https://admin.booking.com/hotel/hoteladmin/reservation.html?res_id=ABC123");
  });

  it("should handle special characters in reservation code", () => {
    const result = getBookingAdminUrl("ABC-123_XYZ");
    expect(result).toContain("ABC-123_XYZ");
  });
});

describe("isActiveNow", () => {
  it("should return true for active reservation", () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const result = isActiveNow(yesterday, tomorrow, "confirmed");
    expect(result).toBe(true);
  });

  it("should return false for future reservation", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split("T")[0];

    const result = isActiveNow(tomorrow, dayAfter, "confirmed");
    expect(result).toBe(false);
  });

  it("should return false for past reservation", () => {
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const result = isActiveNow(twoDaysAgo, yesterday, "confirmed");
    expect(result).toBe(false);
  });

  it("should return false for non-confirmed status", () => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const result = isActiveNow(today, tomorrow, "pending");
    expect(result).toBe(false);
  });
});

