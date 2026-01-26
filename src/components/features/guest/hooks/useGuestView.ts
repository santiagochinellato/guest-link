import { useState } from "react";

export type GuestViewMode = "home" | "rules" | "recommendations" | "wifi" | "transport" | "help";

export function useGuestView() {
  const [activeView, setActiveView] = useState<GuestViewMode>("home");
  const [activeCategory, setActiveCategory] = useState<string>("restaurants");

  const scrollToRules = () => {
    setActiveView("home");
    // Small timeout to allow DOM to render home view if not active
    setTimeout(() => {
      const rulesElement = document.getElementById("rules-section");
      if (rulesElement) {
        rulesElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return {
    activeView,
    setActiveView,
    activeCategory,
    setActiveCategory,
    scrollToRules,
  };
}
