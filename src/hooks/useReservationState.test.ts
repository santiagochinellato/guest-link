import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useReservationState, type ReservationState, type TimeOfDay } from "./useReservationState";

describe("useReservationState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Reservation States", () => {
    it("should return NO_RESERVATION when no dates are provided", () => {
      const { result } = renderHook(() => useReservationState({}));
      expect(result.current.state).toBe("NO_RESERVATION");
    });

    it("should return BEFORE_CHECKIN when check-in is more than 12 hours away", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { result } = renderHook(() =>
        useReservationState({
          checkInDate: tomorrowStr,
          checkOutDate: tomorrowStr,
        })
      );

      expect(result.current.state).toBe("BEFORE_CHECKIN");
    });

    it("should return CHECKIN_DAY when within 12 hours before check-in", () => {
      // Set a fixed time
      const fixedTime = new Date("2024-01-15T10:00:00Z");
      vi.setSystemTime(fixedTime);

      // Check-in is 6 hours from now (within 12 hours)
      const checkInDate = new Date(fixedTime);
      checkInDate.setHours(checkInDate.getHours() + 6);
      const checkInDateStr = checkInDate.toISOString().split("T")[0];

      const checkOutDate = new Date(fixedTime);
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      const checkOutDateStr = checkOutDate.toISOString().split("T")[0];

      const { result } = renderHook(() =>
        useReservationState({
          checkInDate: checkInDateStr,
          checkOutDate: checkOutDateStr,
        })
      );

      // The hook uses useMemo with empty deps, so it captures 'now' at render time
      // Since we set system time before render, it should work
      expect(result.current.state).toBe("CHECKIN_DAY");
    });

    it("should return DURING_STAY when current time is between check-in and check-out", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      vi.setSystemTime(new Date());

      const { result } = renderHook(() =>
        useReservationState({
          checkInDate: yesterdayStr,
          checkOutDate: tomorrowStr,
        })
      );

      expect(result.current.state).toBe("DURING_STAY");
    });

    it("should return AFTER_CHECKOUT when current time is after check-out", () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      vi.setSystemTime(new Date());

      const { result } = renderHook(() =>
        useReservationState({
          checkInDate: twoDaysAgoStr,
          checkOutDate: yesterdayStr,
        })
      );

      expect(result.current.state).toBe("AFTER_CHECKOUT");
    });

    it("should respect stateOverride", () => {
      const { result } = renderHook(() =>
        useReservationState({
          stateOverride: "DURING_STAY",
        })
      );

      expect(result.current.state).toBe("DURING_STAY");
    });
  });

  describe("Time of Day", () => {
    it("should return morning for hours 5-11", () => {
      vi.setSystemTime(new Date("2024-01-01T08:00:00Z"));

      const { result } = renderHook(() => useReservationState({}));
      expect(result.current.timeOfDay).toBe("morning");
    });

    it("should return afternoon for hours 12-18", () => {
      vi.setSystemTime(new Date("2024-01-01T15:00:00Z"));

      const { result } = renderHook(() => useReservationState({}));
      expect(result.current.timeOfDay).toBe("afternoon");
    });

    it("should return evening for hours 19-23", () => {
      vi.setSystemTime(new Date("2024-01-01T20:00:00Z"));

      const { result } = renderHook(() => useReservationState({}));
      expect(result.current.timeOfDay).toBe("evening");
    });

    it("should return night for hours 0-4", () => {
      vi.setSystemTime(new Date("2024-01-01T02:00:00Z"));

      const { result } = renderHook(() => useReservationState({}));
      expect(result.current.timeOfDay).toBe("night");
    });

    it("should respect timeOfDayOverride", () => {
      const { result } = renderHook(() =>
        useReservationState({
          timeOfDayOverride: "evening",
        })
      );

      expect(result.current.timeOfDay).toBe("evening");
    });
  });

  describe("shouldShowAccessCodes", () => {
    it("should return false when no check-in date", () => {
      const { result } = renderHook(() => useReservationState({}));
      expect(result.current.shouldShowAccessCodes).toBe(false);
    });

    it("should return false when check-in is more than 12 hours away", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { result } = renderHook(() =>
        useReservationState({
          checkInDate: tomorrowStr,
        })
      );

      expect(result.current.shouldShowAccessCodes).toBe(false);
    });

    it("should return true when within 12 hours of check-in", () => {
      // Set a fixed time
      const fixedTime = new Date("2024-01-15T10:00:00Z");
      vi.setSystemTime(fixedTime);

      // Check-in is 6 hours from now (within 12 hours)
      const checkInDate = new Date(fixedTime);
      checkInDate.setHours(checkInDate.getHours() + 6);
      const checkInDateStr = checkInDate.toISOString().split("T")[0];

      const { result } = renderHook(() =>
        useReservationState({
          checkInDate: checkInDateStr,
        })
      );

      // The hook uses useMemo with empty deps, so it captures 'now' at render time
      // Since we set system time before render, it should work
      expect(result.current.shouldShowAccessCodes).toBe(true);
    });
  });

  describe("Check-in time handling", () => {
    it("should use provided checkInTime", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { result } = renderHook(() =>
        useReservationState({
          checkInDate: tomorrowStr,
          checkInTime: "14:30",
        })
      );

      expect(result.current.checkIn).not.toBeNull();
      if (result.current.checkIn) {
        expect(result.current.checkIn.getHours()).toBe(14);
        expect(result.current.checkIn.getMinutes()).toBe(30);
      }
    });

    it("should default to 15:00 when no checkInTime provided", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { result } = renderHook(() =>
        useReservationState({
          checkInDate: tomorrowStr,
        })
      );

      expect(result.current.checkIn).not.toBeNull();
      if (result.current.checkIn) {
        expect(result.current.checkIn.getHours()).toBe(15);
        expect(result.current.checkIn.getMinutes()).toBe(0);
      }
    });
  });

  describe("Check-out time handling", () => {
    it("should default to 11:00 for check-out", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { result } = renderHook(() =>
        useReservationState({
          checkOutDate: tomorrowStr,
        })
      );

      expect(result.current.checkOut).not.toBeNull();
      if (result.current.checkOut) {
        expect(result.current.checkOut.getHours()).toBe(11);
        expect(result.current.checkOut.getMinutes()).toBe(0);
      }
    });
  });
});

