"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";

export default function NewPropertyPage() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    wifiSsid: "",
    wifiPassword: "",
    houseRules: "",
  });

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
      slug: prev.slug || generateSlug(name), // Auto-generate slug if empty
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/properties"
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Property</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Create a new welcome guide.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-neutral-800 pb-2">
            Basic Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Name</label>
              <input
                type="text"
                placeholder="e.g. Casa Azul"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (URL)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  /stay/
                </span>
                <input
                  type="text"
                  placeholder="casa-azul"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full pl-14 px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <input
              type="text"
              placeholder="Full address for map integration"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent"
            />
          </div>
        </div>

        {/* WiFi */}
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-neutral-800 pb-2">
            WiFi Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Network Name (SSID)</label>
              <input
                type="text"
                value={formData.wifiSsid}
                onChange={(e) =>
                  setFormData({ ...formData, wifiSsid: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="text"
                value={formData.wifiPassword}
                onChange={(e) =>
                  setFormData({ ...formData, wifiPassword: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent font-mono"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-neutral-800 pb-2">
            Content
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Image</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 gap-2 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm">Click to upload cover photo</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">House Rules</label>
            <textarea
              rows={4}
              placeholder="List your key rules here..."
              value={formData.houseRules}
              onChange={(e) =>
                setFormData({ ...formData, houseRules: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent resize-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link
            href="/dashboard/properties"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
            <Save className="w-4 h-4" />
            Save Property
          </button>
        </div>
      </div>
    </div>
  );
}
