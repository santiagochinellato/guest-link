"use client";

import { AlertCircle, Phone, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: any;
}

export function EmergencyModal({
  isOpen,
  onClose,
  labels,
}: EmergencyModalProps) {
  // In real app, these come from DB (emergency_contacts)
  const CONTACTS = [
    { type: "Police", number: "911", label: "Emergency" },
    { type: "Police", number: "555-0123", label: "Local Station" },
    {
      type: "Medical",
      number: "555-0999",
      label: "Hospital",
      address: "Health Ave 42",
    },
    { type: "Fire", number: "100", label: "Fire Dept" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-3xl z-50 p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">{labels.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full"
              >
                <X className="w-5 h-5 opacity-70" />
              </button>
            </div>

            <div className="space-y-3 pb-8">
              {CONTACTS.map((contact, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-gray-100 dark:border-neutral-800 rounded-xl bg-gray-50 dark:bg-neutral-800/50"
                >
                  <div>
                    <p className="font-bold text-lg">{contact.type}</p>
                    <p className="text-sm text-gray-500">{contact.label}</p>
                    {contact.address && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {contact.address}
                      </p>
                    )}
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none active:scale-95 transition-transform"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
