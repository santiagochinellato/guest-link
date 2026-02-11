import { describe, it, expect } from "vitest";
import { parseGuestInfo } from "./guest-info";

describe("parseGuestInfo", () => {
  it("should parse simple name", () => {
    const result = parseGuestInfo("John Doe");
    expect(result.name).toBe("John Doe");
    expect(result.guestCountText).toBeNull();
  });

  it("should parse name with guest count", () => {
    const result = parseGuestInfo("John Doe2 adultos");
    expect(result.name).toBe("John Doe");
    expect(result.guestCountText).toBe("2 adultos");
  });

  it("should parse name with multiple guests", () => {
    const result = parseGuestInfo("John Doe5 adultos");
    expect(result.name).toBe("John Doe");
    expect(result.guestCountText).toBe("5 adultos");
  });

  it("should handle name without guest count", () => {
    const result = parseGuestInfo("Jane Smith");
    expect(result.name).toBe("Jane Smith");
    expect(result.guestCountText).toBeNull();
  });

  it("should handle empty string", () => {
    const result = parseGuestInfo("");
    expect(result.name).toBe("");
    expect(result.guestCountText).toBeNull();
  });

  it("should handle name with complex guest count", () => {
    const result = parseGuestInfo("Cecilia Paula Montoya1 adulto y 1 niño (6 años)");
    expect(result.name).toBe("Cecilia Paula Montoya");
    expect(result.guestCountText).toBe("1 adulto y 1 niño (6 años)");
  });

  it("should handle name with guest count in different format", () => {
    const result = parseGuestInfo("John Doe2 guests");
    expect(result.name).toBe("John Doe");
    expect(result.guestCountText).toBe("2 guests");
  });
});

