import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WifiCard } from "./WifiCard";
import { toast } from "sonner";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock clipboard API (compatible con happy-dom)
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
});

describe("WifiCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when ssid is not provided", () => {
    const { container } = render(<WifiCard ssid="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render SSID when provided", () => {
    render(<WifiCard ssid="TestWiFi" />);
    expect(screen.getByText("TestWiFi")).toBeInTheDocument();
  });

  it("should render password field when password is provided", () => {
    render(<WifiCard ssid="TestWiFi" password="password123" />);
    expect(screen.getByText("••••••••")).toBeInTheDocument();
  });

  it("should toggle password visibility", async () => {
    const { container } = render(<WifiCard ssid="TestWiFi" password="password123" />);

    // Find button by icon (Eye/EyeOff)
    const toggleButton = container.querySelector('button[class*="p-1.5"]');
    expect(toggleButton).toBeInTheDocument();
    
    if (toggleButton) {
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText("password123")).toBeInTheDocument();
      });

      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText("••••••••")).toBeInTheDocument();
      });
    }
  });

  it("should copy password to clipboard", async () => {
    const { container } = render(<WifiCard ssid="TestWiFi" password="password123" />);

    // Find copy button by finding the button with Copy icon
    const copyButton = container.querySelector('button[class*="bg-white"]');
    expect(copyButton).toBeInTheDocument();
    
    if (copyButton) {
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("password123");
        expect(toast.success).toHaveBeenCalledWith("Contraseña copiada al portapapeles");
      });
    }
  });

  it("should not show copy button when password is not provided", () => {
    render(<WifiCard ssid="TestWiFi" />);
    const copyButton = screen.queryByRole("button", { name: /copy/i });
    expect(copyButton).not.toBeInTheDocument();
  });

  it("should render QR code when provided", () => {
    render(
      <WifiCard
        ssid="TestWiFi"
        password="password123"
        qrCode="https://example.com/qr.png"
      />
    );

    const qrImage = screen.getByAltText("WiFi QR");
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute("src", "https://example.com/qr.png");
  });

  it("should show WiFi icon when password provided but no qrCode", () => {
    const { container } = render(
      <WifiCard
        ssid="TestWiFi"
        password="password123"
      />
    );

    // When no qrCode prop, it shows WiFi icon placeholder
    const wifiIcon = container.querySelector("svg");
    expect(wifiIcon).toBeInTheDocument();
  });

  it("should show WiFi icon when no QR code is provided", () => {
    const { container } = render(<WifiCard ssid="TestWiFi" />);
    // Should show WiFi icon placeholder (SVG)
    const wifiIcon = container.querySelector("svg");
    expect(wifiIcon).toBeInTheDocument();
  });
});

