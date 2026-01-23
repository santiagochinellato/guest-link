"use client";

import { PropertyForm } from "@/components/admin/property-form";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditPropertyPage() {
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    // In real app, fetch from API /api/properties/[id]
    // For now, mock data
    setTimeout(() => {
      setInitialData({
        name: "Casa Azul - Ocean View",
        slug: "casa-azul",
        address: "Av. Del Mar 123",
        city: "San Diego",
        country: "USA",
        latitude: "32.7157",
        longitude: "-117.1611",
        wifiSsid: "CasaAzul_Guest",
        wifiPassword: "sunset-views-2024",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        houseRules: "No smoking inside. Quiet hours after 10 PM.",
      } as any);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div className="p-8">Loading property...</div>;

  return <PropertyForm initialData={initialData} isEditMode={true} />;
}
