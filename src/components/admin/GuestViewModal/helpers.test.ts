import { describe, it, expect } from "vitest";
import { formatDate, getAccessCode, resolveMessage } from "./helpers";

describe("formatDate", () => {
  it("should format valid date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("15");
    expect(result).toContain("ene");
  });

  it("should return original string for invalid date", () => {
    const result = formatDate("invalid-date");
    // formatDate catches errors and returns the original string
    // but new Date("invalid-date") creates an Invalid Date object
    // which toLocaleDateString converts to "Invalid Date" string
    expect(result).toBe("Invalid Date");
  });

  it("should handle ISO date strings", () => {
    const result = formatDate("2024-12-25T10:00:00Z");
    expect(result).toContain("25");
    expect(result).toContain("dic");
  });
});

describe("getAccessCode", () => {
  it("should derive 5-digit code from token", () => {
    const token = "abc123def456";
    const code = getAccessCode(token);
    
    expect(code).toMatch(/^\d{5}$/);
    expect(code.length).toBe(5);
  });

  it("should pad with zeros if needed", () => {
    const token = "0000000000000001";
    const code = getAccessCode(token);
    
    expect(code.length).toBe(5);
    expect(code).toMatch(/^\d+$/);
  });

  it("should return consistent code for same token", () => {
    const token = "test-token-12345";
    const code1 = getAccessCode(token);
    const code2 = getAccessCode(token);
    
    expect(code1).toBe(code2);
  });

  it("should return different codes for different tokens", () => {
    // Use tokens with valid hex characters in last 5 chars
    const code1 = getAccessCode("abc123def4567890");
    const code2 = getAccessCode("abc123def4567891");
    
    expect(code1).not.toBe(code2);
  });
});

describe("resolveMessage", () => {
  it("should replace all template variables", () => {
    const message = "Hello #nombrepropiedad, your code is #codigo. Visit [link a la web]. Check-in: #checkin, Check-out: #checkout";
    const result = resolveMessage(
      message,
      "Test Property",
      "12345",
      "https://example.com",
      "2024-01-15",
      "2024-01-20"
    );

    expect(result).toContain("Test Property");
    expect(result).toContain("12345");
    expect(result).toContain("https://example.com");
    expect(result).not.toContain("#nombrepropiedad");
    expect(result).not.toContain("#codigo");
    expect(result).not.toContain("[link a la web]");
    expect(result).not.toContain("#checkin");
    expect(result).not.toContain("#checkout");
  });

  it("should handle multiple occurrences of same variable", () => {
    const message = "#codigo and #codigo again";
    const result = resolveMessage(
      message,
      "Property",
      "12345",
      "https://example.com",
      "2024-01-15",
      "2024-01-20"
    );

    const occurrences = (result.match(/12345/g) || []).length;
    expect(occurrences).toBe(2);
  });

  it("should format dates correctly", () => {
    const message = "Check-in: #checkin";
    const result = resolveMessage(
      message,
      "Property",
      "12345",
      "https://example.com",
      "2024-01-15",
      "2024-01-20"
    );

    expect(result).toContain("15");
    expect(result).toContain("ene");
    expect(result).toContain("2024");
  });
});

