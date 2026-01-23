"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteProperty } from "@/lib/actions/properties";

interface PropertyActionsMenuProps {
  propertyId: number;
  slug: string;
}

export function PropertyActionsMenu({
  propertyId,
  slug,
}: PropertyActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-lg z-[100] overflow-hidden"
          >
            <div className="py-1">
              <Link
                href={`/stay/${slug}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Eye className="w-4 h-4" />
                View as Guest
              </Link>
              <Link
                href={`/dashboard/properties/${propertyId}/edit`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Edit className="w-4 h-4" />
                Edit Property
              </Link>
              <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
