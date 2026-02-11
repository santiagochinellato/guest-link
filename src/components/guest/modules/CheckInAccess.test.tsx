import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckInAccess } from "./CheckInAccess";

// Mock AccessDetailsDrawer
vi.mock("./AccessDetailsDrawer", () => ({
  AccessDetailsDrawer: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="access-details-drawer" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

describe("CheckInAccess", () => {
  it("should render check-in and check-out times when no dates provided", () => {
    render(
      <CheckInAccess
        checkInTime="15:00"
        checkOutTime="11:00"
      />
    );

    expect(screen.getByText("Ingreso")).toBeInTheDocument();
    expect(screen.getByText("Salida")).toBeInTheDocument();
    expect(screen.getByText("15:00")).toBeInTheDocument();
    expect(screen.getByText("11:00")).toBeInTheDocument();
  });

  it("should use default times when not provided", () => {
    render(<CheckInAccess />);

    expect(screen.getByText("15:00")).toBeInTheDocument();
    expect(screen.getByText("11:00")).toBeInTheDocument();
  });

  it("should render formatted dates when valid dates are provided", () => {
    render(
      <CheckInAccess
        checkInDate="2024-01-15"
        checkOutDate="2024-01-20"
        checkInTime="15:00"
        checkOutTime="11:00"
      />
    );

    // Should show formatted dates
    expect(screen.getByText("15:00")).toBeInTheDocument();
    expect(screen.getByText("11:00")).toBeInTheDocument();
  });

  it("should not render dates when invalid dates are provided", () => {
    render(
      <CheckInAccess
        checkInDate="invalid-date"
        checkOutDate="invalid-date"
        checkInTime="15:00"
        checkOutTime="11:00"
      />
    );

    // Should fall back to showing only times
    expect(screen.getByText("15:00")).toBeInTheDocument();
    expect(screen.getByText("11:00")).toBeInTheDocument();
  });

  it("should pass access codes to AccessDetailsDrawer", () => {
    const { container } = render(
      <CheckInAccess
        accessCode="1234"
        alarmCode="5678"
        hasParking={true}
        parkingDetails="Parking available"
        accessSteps={[{ text: "Step 1" }]}
        showCodes={true}
      />
    );

    expect(container.querySelector('[data-testid="access-details-drawer"]')).toBeInTheDocument();
  });

  it("should handle null/undefined values gracefully", () => {
    render(
      <CheckInAccess
        checkInTime={null}
        checkOutTime={undefined}
        checkInDate={null}
        checkOutDate={undefined}
      />
    );

    // Should use defaults
    expect(screen.getByText("15:00")).toBeInTheDocument();
    expect(screen.getByText("11:00")).toBeInTheDocument();
  });
});

