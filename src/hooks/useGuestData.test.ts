import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGuestData } from "./useGuestData";
import type { GuestProperty } from "@/types/dtos";

const mockProperty: GuestProperty = {
  id: 1,
  name: "Test Property",
  slug: "test-property",
  address: "123 Test St",
  city: "Test City",
  country: "Test Country",
  latitude: "-41.123",
  longitude: "-71.456",
  wifiSsid: "TestWiFi",
  wifiPassword: "password123",
  wifiQrCode: "data:image/png;base64,test",
  coverImageUrl: "https://example.com/image.jpg",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  access: {
    instructions: "Test instructions",
    hasParking: true,
    parkingDetails: "Parking available",
    accessCode: "1234",
    alarmCode: "5678",
    accessSteps: [{ text: "Step 1" }, { text: "Step 2" }],
  },
  houseRules: {
    text: "Test rules",
    allowed: ["Allowed 1", "Allowed 2"],
    prohibited: ["Prohibited 1"],
  },
  preCheckIn: {
    steps: [{ text: "Pre-check-in step 1" }],
    notes: "Pre-check-in notes",
  },
  recommendations: [
    {
      id: 1,
      title: "Restaurant 1",
      categoryType: "gastronomy",
      formattedAddress: "123 Food St",
      googleMapsLink: "https://maps.google.com",
      description: "Great food",
      rating: 4.5,
      userRatingsTotal: 100,
    },
    {
      id: 2,
      title: "Taxi Service",
      categoryType: "taxi",
      formattedAddress: "456 Taxi St",
      googleMapsLink: "https://maps.google.com",
      description: "Taxi service",
      rating: 4.0,
      userRatingsTotal: 50,
    },
    {
      id: 3,
      title: "Trail 1",
      categoryType: "trails",
      formattedAddress: "789 Trail St",
      googleMapsLink: "https://maps.google.com",
      description: "Beautiful trail",
      rating: 5.0,
      userRatingsTotal: 200,
    },
  ],
  transport: [
    {
      id: 1,
      name: "Taxi Service",
      type: "taxi",
      description: "Local taxi",
      phone: "+1234567890",
      website: "https://taxi.com",
      scheduleInfo: "24/7",
      priceInfo: "$10",
    },
  ],
  emergencyContacts: [],
};

describe("useGuestData", () => {
  it("should return all property data", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.name).toBe("Test Property");
    expect(result.current.address).toBe("123 Test St");
    expect(result.current.wifiSsid).toBe("TestWiFi");
  });

  it("should provide effective access codes", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.effectiveAccessCode).toBe("1234");
    expect(result.current.effectiveAlarmCode).toBe("5678");
    expect(result.current.effectiveAccessSteps).toEqual([
      { text: "Step 1" },
      { text: "Step 2" },
    ]);
  });

  it("should provide effective house rules", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.effectiveHouseRules).toBe("Test rules");
    expect(result.current.effectiveAllowed).toEqual(["Allowed 1", "Allowed 2"]);
    expect(result.current.effectiveProhibited).toEqual(["Prohibited 1"]);
  });

  it("should provide effective pre-check-in data", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.effectivePreCheckInSteps).toEqual([
      { text: "Pre-check-in step 1" },
    ]);
    expect(result.current.effectivePreCheckInNotes).toBe("Pre-check-in notes");
  });

  it("should filter out transport types from recommendations", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.filteredRecommendations).toHaveLength(2);
    expect(result.current.filteredRecommendations.every(
      (r) => r.categoryType !== "taxi"
    )).toBe(true);
  });

  it("should extract categories excluding transport", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.categories).toContain("gastronomy");
    expect(result.current.categories).toContain("trails");
    expect(result.current.categories).not.toContain("taxi");
  });

  it("should provide top recommendations (one per category)", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.topRecommendations.length).toBeLessThanOrEqual(4);
    const categoryTypes = result.current.topRecommendations.map((r) => r.categoryType);
    expect(new Set(categoryTypes).size).toBe(categoryTypes.length); // Unique categories
  });

  it("should provide transport recommendations separately", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.transportRecommendations).toHaveLength(1);
    expect(result.current.transportRecommendations[0].type).toBe("taxi");
  });

  it("should extract transport categories", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.transportCategories).toContain("taxi");
  });

  it("should handle openLocation with coordinates", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    result.current.openLocation();

    expect(openSpy).toHaveBeenCalledWith(
      "https://www.google.com/maps/search/?api=1&query=-41.123,-71.456",
      "_blank"
    );

    openSpy.mockRestore();
  });

  it("should handle openLocation with address when no coordinates", () => {
    const propertyWithoutCoords: GuestProperty = {
      ...mockProperty,
      latitude: undefined,
      longitude: undefined,
    };

    const { result } = renderHook(() => useGuestData(propertyWithoutCoords));
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    result.current.openLocation();

    expect(openSpy).toHaveBeenCalledWith(
      "https://www.google.com/maps/search/?api=1&query=123%20Test%20St",
      "_blank"
    );

    openSpy.mockRestore();
  });

  it("should handle missing preCheckIn data", () => {
    const propertyWithoutPreCheckIn = {
      ...mockProperty,
      preCheckIn: undefined,
    };

    const { result } = renderHook(() => useGuestData(propertyWithoutPreCheckIn));

    expect(result.current.effectivePreCheckInSteps).toEqual([]);
    expect(result.current.effectivePreCheckInNotes).toBe("");
  });

  it("should maintain legacy safeAccess reference", () => {
    const { result } = renderHook(() => useGuestData(mockProperty));

    expect(result.current.safeAccess).toBe(mockProperty.access);
  });
});

