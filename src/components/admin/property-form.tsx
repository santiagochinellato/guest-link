"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas";
import { createProperty, updateProperty } from "@/lib/actions/properties";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const LIBRARIES: "places"[] = ["places"];

interface PropertyFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  isEditMode?: boolean;
}

export function PropertyForm({
  initialData = {},
  isEditMode = false,
}: PropertyFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    "Restaurants",
  );

  // Google Maps
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  // Form Setup
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      name: initialData.name || "",
      slug: initialData.slug || "",
      address: initialData.address || "",
      city: initialData.city || "",
      country: initialData.country || "",
      latitude: initialData.latitude || "",
      longitude: initialData.longitude || "",
      checkInTime: initialData.checkInTime || "15:00",
      checkOutTime: initialData.checkOutTime || "11:00",
      wifiSsid: initialData.wifiSsid || "",
      wifiPassword: initialData.wifiPassword || "",
      wifiQrCode: initialData.wifiQrCode || "",
      coverImageUrl: initialData.coverImageUrl || "",
      recommendations: initialData.recommendations || [],
      emergencyContacts: initialData.emergencyContacts || [],
      transport: initialData.transport || [],
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = form;

  // Field Arrays
  const {
    fields: recFields,
    append: appendRec,
    remove: removeRec,
  } = useFieldArray({
    control,
    name: "recommendations",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const {
    fields: transportFields,
    append: appendTransport,
    remove: removeTransport,
  } = useFieldArray({
    control,
    name: "transport",
  });

  // Derived state
  const watchName = watch("name");

  // Slug generator
  useEffect(() => {
    if (!isEditMode && watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setValue("slug", slug);
    }
  }, [watchName, isEditMode, setValue]);

  // Handlers
  const onLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      setAutocomplete(autocomplete);
    },
    [],
  );

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setValue("address", place.formatted_address);
      }

      let city = "";
      let country = "";

      place.address_components?.forEach((comp) => {
        if (comp.types.includes("locality")) city = comp.long_name;
        if (comp.types.includes("country")) country = comp.long_name;
      });

      if (city) setValue("city", city);
      if (country) setValue("country", country);

      if (place.geometry?.location) {
        setValue("latitude", String(place.geometry.location.lat()));
        setValue("longitude", String(place.geometry.location.lng()));
      }
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSaving(true);
    try {
      let res;
      if (isEditMode && initialData.id) {
        res = await updateProperty(initialData.id, data);
      } else {
        res = await createProperty(data);
      }

      if (res.success) {
        setShowSuccessModal(true);
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (e: any) {
      alert("An error occurred: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/properties");
  };

  const generateWifiQr = () => {
    const ssid = watch("wifiSsid");
    const pass = watch("wifiPassword");
    if (ssid) {
      setValue("wifiQrCode", `WIFI:T:WPA;S:${ssid};P:${pass};;`);
    }
  };

  // -- Sub-Components for cleanliness --

  const TABS = [
    { id: "basic", label: "Basic Info", icon: Star },
    { id: "location", label: "Location", icon: MapPin },
    { id: "wifi", label: "WiFi & Access", icon: Wifi },
    { id: "recommendations", label: "Recommendations", icon: Sparkles },
    { id: "transport", label: "Transport", icon: Car },
    { id: "emergency", label: "Emergency", icon: AlertCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-4">
        <div
          onClick={() => router.back()}
          className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </div>
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
        {/* Sidebar Navigation */}
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
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-4 h-4",
                    activeTab === tab.id ? "text-blue-600" : "text-gray-500",
                  )}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-9">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm min-h-[600px] relative"
          >
            {/* --- BASIC INFO --- */}
            <div
              className={cn(
                activeTab === "basic" ? "block" : "hidden",
                "space-y-6",
              )}
            >
              <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                <h3 className="text-xl font-semibold">Basic Information</h3>
                <p className="text-sm text-gray-500">
                  Main details of your property.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Property Name
                  </label>
                  <input
                    {...register("name")}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent active:border-blue-500 outline-none"
                    placeholder="San martin 460"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug (URL)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">
                      guestlink.com/stay/
                    </span>
                    <input
                      {...register("slug")}
                      className="w-full pl-48 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none font-mono text-sm"
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-500" /> Check-in Time
                    </label>
                    <input
                      type="time"
                      {...register("checkInTime")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-orange-500" /> Check-out
                      Time
                    </label>
                    <input
                      type="time"
                      {...register("checkOutTime")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none"
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

            {/* --- LOCATION --- */}
            <div
              className={cn(
                activeTab === "location" ? "block" : "hidden",
                "space-y-6",
              )}
            >
              <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                <h3 className="text-xl font-semibold">Location</h3>
                <p className="text-sm text-gray-500">
                  Address and Map positioning.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search Address (Google Maps)
                  </label>
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={onLoad}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <div className="relative mt-1">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          placeholder="Start typing address..."
                          className="w-full pl-11 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
                        />
                      </div>
                    </Autocomplete>
                  ) : (
                    <p className="text-sm text-gray-400 animate-pulse">
                      Loading Maps API...
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Address
                  </label>
                  <input
                    {...register("address")}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <input
                      {...register("city")}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <input
                      {...register("country")}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- WIFI --- */}
            <div
              className={cn(
                activeTab === "wifi" ? "block" : "hidden",
                "space-y-6",
              )}
            >
              <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                <h3 className="text-xl font-semibold">WiFi Configuration</h3>
                <p className="text-sm text-gray-500">
                  Secure connection details.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    SSID (Network Name)
                  </label>
                  <input
                    {...register("wifiSsid")}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    {...register("wifiPassword")}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={generateWifiQr}
                  className="text-sm text-blue-600 font-semibold hover:underline"
                >
                  Generate QR Code String
                </button>
                {watch("wifiQrCode") && (
                  <span className="ml-4 text-green-500 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Generated
                  </span>
                )}
              </div>
            </div>

            {/* --- RECOMMENDATIONS --- */}
            <div
              className={cn(
                activeTab === "recommendations" ? "block" : "hidden",
                "space-y-6",
              )}
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    Local Recommendations
                  </h3>
                  <p className="text-sm text-gray-500">
                    Manage curated places.
                  </p>
                </div>
              </div>

              {/* Category Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {["Restaurants", "Sights", "Shopping"].map((cat) => (
                  <div
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-800",
                      activeCategory === cat
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-neutral-800",
                    )}
                  >
                    <h4
                      className={cn(
                        "font-bold text-lg",
                        activeCategory === cat
                          ? "text-blue-600"
                          : "text-gray-700 dark:text-gray-300",
                      )}
                    >
                      {cat}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {
                        recFields.filter(
                          (f: any) => f.categoryType === cat.toLowerCase(),
                        ).length
                      }{" "}
                      places
                    </p>
                  </div>
                ))}
              </div>

              {/* Active Category List */}
              {activeCategory && (
                <div className="bg-gray-50 dark:bg-neutral-800/20 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">{activeCategory} List</h4>
                    <button
                      type="button"
                      onClick={() =>
                        appendRec({
                          title: "",
                          formattedAddress: "",
                          googleMapsLink: "",
                          categoryType: activeCategory.toLowerCase(),
                          description: "",
                        })
                      }
                      className="text-sm font-semibold text-blue-600 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Place
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {recFields.map((field: any, index) => {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      if (field.categoryType !== activeCategory.toLowerCase())
                        return null;
                      return (
                        <div
                          key={field.id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm relative group"
                        >
                          <div className="md:col-span-4">
                            <label className="text-[10px] uppercase text-gray-400 font-bold">
                              Name
                            </label>
                            <input
                              {...register(
                                `recommendations.${index}.title` as const,
                              )}
                              className="w-full text-sm font-semibold bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                              placeholder="Place Name"
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="text-[10px] uppercase text-gray-400 font-bold">
                              Address
                            </label>
                            <input
                              {...register(
                                `recommendations.${index}.formattedAddress` as const,
                              )}
                              className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                              placeholder="Address"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[10px] uppercase text-gray-400 font-bold">
                              Maps Link
                            </label>
                            <input
                              {...register(
                                `recommendations.${index}.googleMapsLink` as const,
                              )}
                              className="w-full text-sm text-blue-500 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                              placeholder="https://maps..."
                            />
                          </div>
                          <div className="md:col-span-1 flex items-end justify-end">
                            <button
                              type="button"
                              onClick={() => removeRec(index)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {recFields.filter(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (f: any) =>
                        f.categoryType === activeCategory?.toLowerCase(),
                    ).length === 0 && (
                      <p className="text-center text-gray-400 text-sm italic py-4">
                        No places yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --- TRANSPORT --- */}
            <div
              className={cn(
                activeTab === "transport" ? "block" : "hidden",
                "space-y-6",
              )}
            >
              <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Transport</h3>
                  <p className="text-sm text-gray-500">How to get around.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    appendTransport({ name: "", type: "taxi", description: "" })
                  }
                  className="text-sm font-semibold text-blue-600 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Option
                </button>
              </div>
              <div className="space-y-4">
                {transportFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-xl bg-gray-50 dark:bg-neutral-800/20"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <input
                        {...register(`transport.${index}.name` as const)}
                        placeholder="Provider (e.g. Uber)"
                        className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700"
                      />
                      <select
                        {...register(`transport.${index}.type` as const)}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700"
                      >
                        <option value="taxi">Taxi / Uber</option>
                        <option value="bus">Bus</option>
                        <option value="train">Train</option>
                        <option value="rental">Rental</option>
                      </select>
                    </div>
                    <textarea
                      {...register(`transport.${index}.description` as const)}
                      placeholder="Details..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 resize-none h-20"
                    />
                    <button
                      type="button"
                      onClick={() => removeTransport(index)}
                      className="text-red-500 text-xs mt-2 underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* --- EMERGENCY --- */}
            <div
              className={cn(
                activeTab === "emergency" ? "block" : "hidden",
                "space-y-6",
              )}
            >
              <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Emergency Contacts</h3>
                  <p className="text-sm text-gray-500">Essential numbers.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    appendContact({ name: "", phone: "", type: "other" })
                  }
                  className="text-sm font-semibold text-blue-600 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Contact
                </button>
              </div>
              <div className="space-y-3">
                {contactFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 p-3 bg-white dark:bg-neutral-900 border rounded-xl"
                  >
                    <input
                      {...register(`emergencyContacts.${index}.name` as const)}
                      placeholder="Service Name"
                      className="flex-1 bg-transparent border-none outline-none font-semibold"
                    />
                    <input
                      {...register(`emergencyContacts.${index}.phone` as const)}
                      placeholder="Phone Number"
                      className="w-32 text-right bg-transparent border-none outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {contactFields.length === 0 && (
                  <p className="text-gray-400 italic text-sm">
                    No contacts added.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-neutral-800 mt-8">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving
                  ? "Saving..."
                  : isEditMode
                    ? "Update Property"
                    : "Save Property"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Success!</h3>
            <p className="text-gray-500 mb-6">
              Property has been successfully{" "}
              {isEditMode ? "updated" : "created"}.
            </p>
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
