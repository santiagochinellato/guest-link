import { describe, it, expect } from "vitest";
import { safeJsonParse, buildHouseRules } from "./helpers";

describe("safeJsonParse", () => {
  it("should parse valid JSON string", () => {
    const result = safeJsonParse('{"key": "value"}');
    expect(result).toEqual({ key: "value" });
  });

  it("should return fallback for null", () => {
    const result = safeJsonParse(null);
    expect(result).toEqual({});
  });

  it("should return fallback for undefined", () => {
    const result = safeJsonParse(undefined);
    expect(result).toEqual({});
  });

  it("should return fallback for empty string", () => {
    const result = safeJsonParse("");
    expect(result).toEqual({});
  });

  it("should return fallback for invalid JSON", () => {
    const result = safeJsonParse("invalid json {");
    expect(result).toEqual({});
  });

  it("should use custom fallback", () => {
    const result = safeJsonParse(null, { default: true });
    expect(result).toEqual({ default: true });
  });
});

describe("buildHouseRules", () => {
  it("should build complete house rules JSON", () => {
    const result = buildHouseRules({
      houseRules: "Test rules",
      rulesAllowed: [{ value: "Allowed 1" }, { value: "Allowed 2" }],
      rulesProhibited: [{ value: "Prohibited 1" }],
      accessInstructions: "Test instructions",
      hasParking: true,
      parkingDetails: "Parking info",
      accessCode: "1234",
      alarmCode: "5678",
      accessSteps: [{ text: "Step 1" }, { text: "Step 2" }],
      preCheckInSteps: [{ text: "Pre-step 1" }],
      preCheckInNotes: "Pre-check-in notes",
      hostName: "John Doe",
      hostImage: "image.jpg",
      hostPhone: "+1234567890",
    });

    const parsed = JSON.parse(result);
    expect(parsed.text).toBe("Test rules");
    expect(parsed.allowed).toEqual(["Allowed 1", "Allowed 2"]);
    expect(parsed.prohibited).toEqual(["Prohibited 1"]);
    expect(parsed.access.instructions).toBe("Test instructions");
    expect(parsed.access.hasParking).toBe(true);
    expect(parsed.access.parkingDetails).toBe("Parking info");
    expect(parsed.access.accessCode).toBe("1234");
    expect(parsed.access.alarmCode).toBe("5678");
    expect(parsed.access.accessSteps).toEqual(["Step 1", "Step 2"]);
    expect(parsed.preCheckIn.steps).toEqual(["Pre-step 1"]);
    expect(parsed.preCheckIn.notes).toBe("Pre-check-in notes");
    expect(parsed.host.name).toBe("John Doe");
    expect(parsed.host.image).toBe("image.jpg");
    expect(parsed.host.phone).toBe("+1234567890");
  });

  it("should handle missing optional fields", () => {
    const result = buildHouseRules({
      houseRules: "",
      rulesAllowed: [],
      rulesProhibited: [],
    });

    const parsed = JSON.parse(result);
    expect(parsed.text).toBe("");
    expect(parsed.allowed).toEqual([]);
    expect(parsed.prohibited).toEqual([]);
    expect(parsed.access.instructions).toBe("");
    expect(parsed.access.hasParking).toBe(false);
    expect(parsed.access.accessCode).toBe("");
    expect(parsed.access.alarmCode).toBe("");
    expect(parsed.access.accessSteps).toEqual([]);
    expect(parsed.preCheckIn.steps).toEqual([]);
    expect(parsed.preCheckIn.notes).toBe("");
    expect(parsed.host.name).toBe("");
    expect(parsed.host.image).toBe("");
    expect(parsed.host.phone).toBe("");
  });

  it("should handle undefined arrays", () => {
    const result = buildHouseRules({
      houseRules: "Rules",
    });

    const parsed = JSON.parse(result);
    expect(parsed.allowed).toEqual([]);
    expect(parsed.prohibited).toEqual([]);
    expect(parsed.access.accessSteps).toEqual([]);
    expect(parsed.preCheckIn.steps).toEqual([]);
  });
});

