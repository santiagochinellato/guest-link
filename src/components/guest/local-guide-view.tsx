"use client";

import { useState } from "react";
import {
  Search,
  Map as MapIcon,
  Plus,
  Minus,
  ArrowLeft,
  Star,
  Utensils,
  MapPin,
  ShoppingBag,
  Coffee,
  Navigation,
  Home,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data for Guide
const PLACES = [
  {
    id: 1,
    name: "The Harbor Grill",
    category: "Dining",
    type: "Seafood",
    price: "$$$",
    distance: "1.2 km",
    rating: 4.8,
    isOpen: true,
    description:
      "Fresh catches daily right by the water. Famous for their clam chowder.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4vdQYpa1eQu7gv_o1ntUJoV2vzP3UwO5I8juTwJiNvWwDrd7VBEDuP6PWmaaZ32ttYt7fr_4a5KuUFbryXkZfoR4Sc_p9pExqRyRp0ifkH7MbypC6faLOxHpZlL8wpLw67sTbnYN4kI50CR_FoYBxS9msh8JJDYJidt19nRzUNFnhZA5UG5JGE9mlwoa1U9n4YFTczmXorXwfnp9cQMh6OXKQYYX6dkTDcNrrSPEREZQw074UuMvhXS6hKcap8EZZE1fNsVps6XI",
    lat: 30,
    lng: 30, // Mock coords
  },
  {
    id: 2,
    name: "Oceanview Trail",
    category: "Sights",
    type: "Hiking",
    price: "Free",
    distance: "3.5 km",
    rating: 5.0,
    isOpen: true, // Always open
    description:
      "Scenic coastal walk suitable for all skill levels. Great for sunsets.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEEkR03aGEjIWPX6oRrJ5IB9uqtMLBQWOB3-_42qO8-FRySzpxslsXiMU_qlFS-3w2MLUHwh4VCx8dJ0UjykhaQRLqN2XfeTBDW1JCewo2elPIElDIYlF4T3lXCpvFyoH_mtXOP0JB8PydLT9wcrDgQ73AUE9xCHznrLyVRnM2nDUvlbmp3l8JMbf5cE-eN8CGtFM08nMcziQEfj4341na5VCPjMhaqXzBzrLHzdnAqI-oZylqCQ-WIfVj4UL0ILBMLWAiIOx3Skw",
    lat: 40,
    lng: 40,
  },
  {
    id: 3,
    name: "Downtown Market",
    category: "Shops",
    type: "Shopping",
    price: "$$",
    distance: "0.8 km",
    rating: 4.5,
    isOpen: true,
    description:
      "Local crafts, fresh produce, and unique souvenirs from the region.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDD0XoikhZpvt-DFB9i6DAiPdLw7JN9b35IZoj82q4voU_6x4v0jy0JfAVst4BtoE4nvmXxANFtiIcyTk6Dm28B9bTYyFrLQlHRJkWlTSwQqsQtVTN5Rcf-1ePnYXCdt8Q7TKCqv6ZCqb3DN40MixdWel269ggUS9SXJx8FEvw2saf0D3Ws6ph2wls4n4LWie-dJMT6pi7dea9UdKY_dsu_hE_NxW_CNtvZj3NYMkZ2fA277QU-1nwnf_PGv0wSKcj36iFqpMplCt8",
    lat: 50,
    lng: 50,
  },
  {
    id: 4,
    name: "Coastal Cafe",
    category: "Cafes",
    type: "Cafe",
    price: "$$",
    distance: "0.5 km",
    rating: 4.7,
    isOpen: true,
    description: "Best espresso in town. Try the homemade pastries.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUPdb68CQQnd7vRhiZZ_VCb9GSslSazwvM335v-UiNWhspS00aabORAoc1NPY8g2nT4lMarLrGXChxsWK0QZPlq3W7fobcgWSCOetEBxnYOGwzKVkM0scnDw1A1X5O0pJoRpXxKTw903mR8BViHHUO5j1xyYWLQsE9Fksp7oa5zfPZ0DxrywHYlPF_BZIX4lpUkQLJcs6pJ5oW1cbkU8SdTVdrbc0OhpBaa68Z9L9SF1TB-MLBYdVcD1CGlYVaas7VrLWpBE0dWgM",
    lat: 60,
    lng: 60,
  },
];

const CATEGORIES = [
  { label: "All", icon: Star, active: true },
  { label: "Dining", icon: Utensils, active: false },
  { label: "Sights", icon: MapPin, active: false },
  { label: "Shops", icon: ShoppingBag, active: false },
  { label: "Cafes", icon: Coffee, active: false },
];

export function LocalGuideView() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-[#0e1b1a] dark:text-white h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e8f3f2] dark:border-[#2a3b3a] px-6 lg:px-10 py-3 bg-white dark:bg-[#1a2c2b] z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-[#0f756d]">
            <div className="size-8 flex items-center justify-center rounded-lg bg-[#0f756d]/10">
              <Home className="w-5 h-5 text-[#0f756d]" />
            </div>
            <h2 className="text-[#0e1b1a] dark:text-white text-lg font-bold leading-tight tracking-tight">
              HOSTLY
            </h2>
          </div>
          {/* Desktop Search */}
          <label className="hidden md:flex flex-col min-w-40 !h-10 w-64">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full border border-transparent focus-within:border-[#0f756d]/50 transition-colors">
              <div className="text-[#0f756d] flex border-none bg-[#e8f3f2] dark:bg-[#2a3b3a] items-center justify-center pl-4 rounded-l-xl border-r-0">
                <Search className="w-4 h-4" />
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1b1a] dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e8f3f2] dark:bg-[#2a3b3a] focus:border-none h-full placeholder:text-[#4f9690] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                placeholder="Search places..."
              />
            </div>
          </label>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden lg:flex items-center gap-6">
            <Link
              className="text-[#0e1b1a] dark:text-gray-200 hover:text-[#0f756d] transition-colors text-sm font-medium leading-normal"
              href="#"
            >
              Home
            </Link>
            <Link
              className="text-[#0e1b1a] dark:text-gray-200 hover:text-[#0f756d] transition-colors text-sm font-medium leading-normal"
              href="#"
            >
              My Trip
            </Link>
            <Link
              className="text-[#0f756d] text-sm font-medium leading-normal"
              href="#"
            >
              Local Guide
            </Link>
            <Link
              className="text-[#0e1b1a] dark:text-gray-200 hover:text-[#0f756d] transition-colors text-sm font-medium leading-normal"
              href="#"
            >
              Support
            </Link>
          </div>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white shadow-sm cursor-pointer"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBOoUyh_UFujWEibO3VGe0TpkYzw6ul0JJC1kSKoMQS8K3u2XZHMRJdney9F1suNaZTCrMdoZ_Qtnv7gDI2_yPaTfl91Gq7PryIhtNR_-64jwX6-I58gZi4cZNKt7kcimYei1ni8Iw4fxOlU6kPFyiFPf5up8sAlCTa_NZ0_rErL6-UUI5oljIQjfoYZBPyfvhqxB4EF9cT149u48NAFXLxm8Lz0H2CAj1o4mvnW-KFP7iUgXG7ck97Co_YizLlS3Owg3Q8V1mccLw")',
            }}
          ></div>
        </div>
      </header>

      {/* Main Content Area (Split View) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: List View */}
        <aside className="w-full lg:w-[480px] xl:w-[540px] flex flex-col bg-white dark:bg-[#1a2c2b] border-r border-[#e8f3f2] dark:border-[#2a3b3a] shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 shrink-0">
          {/* Sidebar Header & Filters */}
          <div className="p-6 pb-2 shrink-0">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Link
                className="text-[#0f756d] hover:underline text-sm font-medium leading-normal"
                href="#"
              >
                My Trip
              </Link>
              <span className="text-gray-400 text-sm font-medium leading-normal">
                /
              </span>
              <span className="text-[#0e1b1a] dark:text-white text-sm font-medium leading-normal">
                Local Guide
              </span>
            </div>
            <h1 className="text-[#0e1b1a] dark:text-white tracking-tight text-3xl font-bold leading-tight pb-2">
              Discover & Explore
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal pb-6">
              Curated local favorites selected for your stay.
            </p>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 mask-linear">
              <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#0f756d] text-white pl-3 pr-4 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#0f756d]/20">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">All</span>
              </button>
              {CATEGORIES.slice(1).map((cat) => (
                <button
                  key={cat.label}
                  className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e8f3f2] hover:bg-[#d0e6e4] dark:bg-[#2a3b3a] dark:hover:bg-[#364a48] pl-3 pr-4 transition-colors"
                >
                  <cat.icon className="w-5 h-5 text-[#0e1b1a] dark:text-gray-300" />
                  <span className="text-[#0e1b1a] dark:text-gray-300 text-sm font-medium">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 space-y-4">
            {PLACES.map((place) => (
              <div
                key={place.id}
                className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white dark:bg-[#1a2c2b] border border-gray-100 dark:border-[#2a3b3a] hover:border-[#0f756d]/30 hover:shadow-lg hover:shadow-[#0f756d]/5 transition-all cursor-pointer"
              >
                <div className="w-full sm:w-32 h-32 shrink-0 rounded-lg overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={place.image}
                    alt={place.name}
                  />
                  <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-[#0e1b1a] dark:text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-orange-500 fill-orange-500" />{" "}
                    {place.rating}
                  </div>
                </div>
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-[#0e1b1a] dark:text-white leading-tight">
                        {place.name}
                      </h3>
                      {place.isOpen && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Open
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {place.type} • {place.price} • {place.distance}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {place.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button className="text-sm font-medium text-[#0f756d] hover:text-[#0f756d]/80">
                      View Details
                    </button>
                    <button className="flex items-center gap-2 bg-[#0f756d]/10 hover:bg-[#0f756d]/20 text-[#0f756d] text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                      <Navigation className="w-4 h-4" />
                      Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Content: Map View */}
        <main className="flex-1 relative bg-gray-100 dark:bg-[#112120] overflow-hidden hidden lg:block">
          {/* Map Background (Placeholder) */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-74.006,40.7128,13,0/1000x1000?access_token=YOUR_TOKEN")',
              opacity: 0.8,
            }}
          >
            <div className="absolute inset-0 bg-white/20 dark:bg-black/20 mix-blend-overlay"></div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
            <button className="size-10 bg-white dark:bg-[#1a2c2b] rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 text-[#0e1b1a] dark:text-white transition-colors">
              <Navigation className="w-5 h-5" />
            </button>
            <button className="size-10 bg-white dark:bg-[#1a2c2b] rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 text-[#0e1b1a] dark:text-white transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            <button className="size-10 bg-white dark:bg-[#1a2c2b] rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 text-[#0e1b1a] dark:text-white transition-colors">
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Home Pin */}
          <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-full flex flex-col items-center z-10 animate-bounce">
            <div className="bg-black/80 text-white text-xs py-1 px-2 rounded mb-1 whitespace-nowrap">
              You are here
            </div>
            <div className="size-12 bg-white rounded-full shadow-2xl p-1 border-4 border-white ring-2 ring-black/10">
              <div className="w-full h-full bg-[#0e1b1a] rounded-full flex items-center justify-center text-white">
                <Home className="w-6 h-6" />
              </div>
            </div>
          </div>
        </main>

        {/* Floating Action Button (Fixed Bottom Center) */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-700 lg:hidden">
          <button className="group flex items-center gap-3 bg-[#0f756d] hover:bg-[#0b5c55] text-white pl-4 pr-1.5 py-1.5 rounded-full shadow-xl shadow-[#0f756d]/30 transition-all hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-md">
            <div className="flex flex-col items-start pl-1">
              <span className="text-xs font-medium opacity-80 uppercase tracking-wider leading-none mb-0.5">
                Return to
              </span>
              <span className="text-sm font-bold leading-none">Property</span>
            </div>
            <div className="bg-white/20 group-hover:bg-white/30 rounded-full px-3 py-2 flex items-center gap-1.5 transition-colors">
              <Navigation className="w-4 h-4" />
              <span className="text-sm font-bold">1.2 km</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
