"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { deleteProperty } from "@/lib/actions/properties";

interface PropertyCardActionsProps {
  propertyId: number;
  slug: string;
}

export function PropertyCardActions({
  propertyId,
  slug,
}: PropertyCardActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this property? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteProperty(propertyId);
      if (!res.success) {
        alert(res.error || "Failed to delete property");
      }
    } catch {
      alert("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/stay/${slug}`}
        target="_blank"
        className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-brand-copper hover:text-white dark:hover:bg-brand-copper dark:hover:text-white transition-colors flex items-center gap-2 shadow-sm"
        title="View as Guest"
      >
        <Eye className="w-4 h-4" />
        <p className="text-xs font-medium">Vista del huésped</p>
      </Link>
      <Link
        href={`/dashboard/properties/${propertyId}/edit`}
        className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-brand-void hover:text-white dark:hover:bg-white dark:hover:text-brand-void transition-colors flex items-center gap-2 shadow-sm"
        title="Edit Property"
      >
        <Edit className="w-4 h-4" />
        <p className="text-xs font-medium">Editar propiedad</p>
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
        title="Delete Property"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
        <p className="text-xs font-medium">Eliminar propiedad</p>
      </button>
    </div>
  );
}
