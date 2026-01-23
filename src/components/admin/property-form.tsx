"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  MapPin,
  Clock,
  Wifi,
  Sparkles,
  AlertCircle,
  Car,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyFormProps {
  initialData?: any; // Replace 'any' with Property type in real app
  isEditMode?: boolean;
}

export function PropertyForm({
  initialData = {},
  isEditMode = false,
}: PropertyFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    slug: initialData.slug || "",
    // Location
    address: initialData.address || "",
    city: initialData.city || "",
    country: initialData.country || "",
    latitude: initialData.latitude || "",
    longitude: initialData.longitude || "",
    // Time
    checkInTime: initialData.checkInTime || "14:00",
    checkOutTime: initialData.checkOutTime || "11:00",
    // Wifi
    wifiSsid: initialData.wifiSsid || "",
    wifiPassword: initialData.wifiPassword || "",
    wifiQrCode: initialData.wifiQrCode || "",
    // Content
    houseRules: initialData.houseRules || "",
    coverImageUrl: initialData.coverImageUrl || "",
  });

  // Recommendations State
  const [recommendationsList, setRecommendationsList] = useState<any[]>(
    initialData.recommendations || [],
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isAutoSuggesting, setIsAutoSuggesting] = useState(false);

  // --- Handlers ---

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug:
        !isEditMode && (prev.slug || generateSlug(name))
          ? generateSlug(name)
          : prev.slug,
    }));
  };

  const generateWifiQr = () => {
    setIsGeneratingQr(true);
    const qrString = `WIFI:T:WPA;S:${formData.wifiSsid};P:${formData.wifiPassword};;`;
    setFormData((prev) => ({ ...prev, wifiQrCode: qrString }));
    setTimeout(() => setIsGeneratingQr(false), 500);
  };

  const getRecsByCategory = (cat: string) =>
    recommendationsList.filter((r) => r.categoryType === cat.toLowerCase());

  const handleAutoSuggest = async () => {
    // We send whatever data is currently in the form to allow auto-suggest on new/unsaved properties
    // or properties where we just changed the address.
    const propertyId = initialData.id || 1;
    setIsAutoSuggesting(true);

    try {
      const res = await fetch(`/api/properties/${propertyId}/auto-suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: formData.latitude,
          longitude: formData.longitude,
          city: formData.city,
          address: formData.address,
          country: formData.country, // useful context
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }

      if (data.suggestions) {
        setRecommendationsList((prev) => [...prev, ...data.suggestions]);
      }
    } catch (e: any) {
      console.error("Auto suggest failed", e);
      alert(
        e.message ||
          "Failed to generate suggestions. Please ensure a location is set.",
      );
    } finally {
      setIsAutoSuggesting(false);
    }
  };

  const handleAddManualPlace = () => {
    if (!activeCategory) return;
    const newPlace = {
      title: "New Place",
      formattedAddress: "",
      description: "",
      categoryType: activeCategory.toLowerCase(),
      id: Date.now(),
    };
    setRecommendationsList((prev) => [...prev, newPlace]);
  };

  const handleSave = () => {
    console.log("Saving Property Payload:", {
      ...formData,
      recommendations: recommendationsList,
      timestamp: new Date().toISOString(),
    });
    alert(`Property ${isEditMode ? "updated" : "created"}! Check console.`);
  };

  const TABS = [
    { id: "basic", label: "Basic Info", icon: <Star className="w-4 h-4" /> },
    { id: "location", label: "Location", icon: <MapPin className="w-4 h-4" /> },
    { id: "wifi", label: "WiFi & Access", icon: <Wifi className="w-4 h-4" /> },
    {
      id: "recommendations",
      label: "Recommendations",
      icon: <Sparkles className="w-4 h-4" />,
    },
    { id: "transport", label: "Transport", icon: <Car className="w-4 h-4" /> },
    {
      id: "emergency",
      label: "Emergency",
      icon: <AlertCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <Link
          href="/dashboard/properties"
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Property" : "New Property"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isEditMode
              ? "Manage your existing guide."
              : "Create and configure your welcome guide."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs - Sticky */}
        <div className="lg:col-span-3">
          <div className="sticky top-6 flex flex-col gap-2">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Configuration
            </h3>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left",
                  activeTab === tab.id
                    ? "bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-neutral-700 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-200",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-neutral-700",
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                      : "bg-gray-100 dark:bg-neutral-800 text-gray-500",
                  )}
                >
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-9">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm min-h-[600px] relative">
            {/* BASIC INFO */}
            {activeTab === "basic" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Basic Information
                  </h3>
                  <p className="text-sm text-gray-500">
                    Main details of your property.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Property Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Casa Azul"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Slug (URL)
                    </label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono group-focus-within:text-blue-500 transition-colors">
                        guestlink.com/stay/
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full pl-40 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" /> Check-in
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.checkInTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            checkInTime: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" /> Check-out
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.checkOutTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            checkOutTime: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cover Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-500 gap-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 hover:border-blue-500/50 transition-all cursor-pointer group">
                      <div className="p-4 bg-gray-100 dark:bg-neutral-800 rounded-full group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Click to upload cover photo
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          SVG, PNG, JPG or GIF (max. 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LOCATION */}
            {activeTab === "location" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Location
                  </h3>
                  <p className="text-sm text-gray-500">
                    Help guests find your place.
                  </p>
                </div>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Start typing to search..."
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full pl-11 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-black focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-black focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WIFI */}
            {activeTab === "wifi" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold tracking-tight">
                    WiFi & Access
                  </h3>
                  <p className="text-sm text-gray-500">
                    Share connection details securely.
                  </p>
                </div>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Network Name (SSID)
                      </label>
                      <input
                        type="text"
                        value={formData.wifiSsid}
                        onChange={(e) =>
                          setFormData({ ...formData, wifiSsid: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-black focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <input
                        type="text"
                        value={formData.wifiPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            wifiPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-black focus:border-blue-500 outline-none font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-gray-900 to-black dark:from-neutral-800 dark:to-neutral-900 rounded-2xl flex items-center justify-between text-white shadow-lg">
                    <div>
                      <p className="font-semibold text-base mb-1">
                        One-Click Connect QR
                      </p>
                      <p className="text-xs text-gray-400 max-w-xs">
                        {formData.wifiQrCode
                          ? "✅ QR String Ready"
                          : "Generate a standardized string for automatic connection."}
                      </p>
                    </div>
                    <button
                      onClick={generateWifiQr}
                      disabled={!formData.wifiSsid}
                      className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all shadow-md"
                    >
                      {isGeneratingQr ? "Generating..." : "Generate QR"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RECOMMENDATIONS */}
            {activeTab === "recommendations" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">
                      Local Recommendations
                    </h3>
                    <p className="text-sm text-gray-500">
                      Curate places for your guests.
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                    onClick={handleAutoSuggest}
                    disabled={isAutoSuggesting}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isAutoSuggesting ? "Analyzing..." : "Auto-Suggest"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Restaurants",
                      color:
                        "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                    },
                    {
                      name: "Sights",
                      color:
                        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                    },
                    {
                      name: "Shopping",
                      color:
                        "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                    },
                  ].map((cat) => {
                    const count = getRecsByCategory(cat.name).length;
                    const isSelected = activeCategory === cat.name;

                    return (
                      <div
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        className={cn(
                          "relative p-6 border rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between min-h-[140px]",
                          isSelected
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                            : "border-gray-200 dark:border-neutral-800 hover:border-blue-300 bg-gray-50 dark:bg-neutral-800/30",
                        )}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={cn(
                                "font-bold text-lg leading-tight",
                                isSelected
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "",
                              )}
                            >
                              {cat.name}
                            </span>
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0",
                                cat.color,
                              )}
                            >
                              {count} places
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors mt-4 block">
                          Click to manage
                        </span>
                      </div>
                    );
                  })}
                </div>

                {activeCategory ? (
                  <div className="mt-6 p-6 bg-gray-50 dark:bg-neutral-800/30 rounded-2xl border border-gray-200 dark:border-neutral-800 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-700 dark:text-gray-200">
                        {activeCategory} List
                      </h4>
                      <button
                        onClick={handleAddManualPlace}
                        className="text-sm text-blue-600 font-semibold hover:underline"
                      >
                        + Add New Place
                      </button>
                    </div>

                    <div className="space-y-3">
                      {getRecsByCategory(activeCategory).length === 0 && (
                        <div className="py-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800">
                          <p className="text-sm text-gray-400 italic">
                            No places yet.
                          </p>
                          <p className="text-xs text-gray-400 mb-4">
                            Use Auto-Suggest or add manually.
                          </p>
                          <button
                            onClick={handleAddManualPlace}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                          >
                            Create Place
                          </button>
                        </div>
                      )}
                      {getRecsByCategory(activeCategory).map((place, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
                        >
                          <div className="flex-1 space-y-2">
                            <input
                              value={place.title}
                              onChange={(e) => {
                                const newList = [...recommendationsList];
                                const index = newList.findIndex(
                                  (r) => r === place,
                                );
                                newList[index].title = e.target.value;
                                setRecommendationsList(newList);
                              }}
                              className="w-full font-semibold bg-transparent outline-none placeholder:text-gray-300 focus:text-blue-600 transition-colors"
                              placeholder="Place Name"
                            />
                            <input
                              value={place.formattedAddress || ""}
                              onChange={(e) => {
                                const newList = [...recommendationsList];
                                const index = newList.findIndex(
                                  (r) => r === place,
                                );
                                newList[index].formattedAddress =
                                  e.target.value;
                                setRecommendationsList(newList);
                              }}
                              className="w-full text-xs text-gray-500 bg-transparent outline-none"
                              placeholder="Address"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setRecommendationsList((prev) =>
                                prev.filter((r) => r !== place),
                              );
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <div className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 bg-gray-50 dark:bg-neutral-800/30 rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-neutral-700">
                    <p className="text-gray-500 font-medium">
                      Select a category above to start adding recommendations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TRANSPORT */}
            {activeTab === "transport" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-lg font-semibold">Transport Options</h3>
                  <button className="text-sm text-blue-600 font-medium hover:underline">
                    + Add Option
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none">
                      <option>Select Type...</option>
                      <option value="taxi">Taxi / Uber</option>
                      <option value="bus">Public Bus</option>
                      <option value="train">Train / Metro</option>
                      <option value="rental">Car Rental</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Provider Name (e.g. Uber, Local Taxi)"
                      className="px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Instructions, schedule or price info..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <button className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all">
                      Add Transport
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EMERGENCY */}
            {activeTab === "emergency" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-lg font-semibold">Emergency Contacts</h3>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-blue-700 dark:text-blue-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>
                    Default emergency numbers (Police 911, etc.) will be
                    automatically suggested based on the property country.
                  </p>
                </div>

                <div className="space-y-4">
                  {["Police", "Ambulance", "Fire Dept"].map((service) => (
                    <div
                      key={service}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{service}</p>
                          <p className="text-xs text-gray-500">Local Service</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Number"
                        className="w-32 text-right bg-transparent border-b border-transparent focus:border-gray-300 outline-none font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-neutral-800 mt-8">
        <Link
          href="/dashboard/properties"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <Save className="w-4 h-4" />
          {isEditMode ? "Update Property" : "Save Property"}
        </button>
      </div>
    </div>
  );
}
