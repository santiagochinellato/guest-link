import { MapPin, Phone, Globe, Star } from "lucide-react";
import { motion } from "framer-motion";

interface RecommendationCardProps {
  title: string;
  description: string;
  address?: string; // Optional
  phone?: string;
  website?: string;
  priceRange?: number;
  latitude?: string;
  longitude?: string;
  isFavorite?: boolean;
}

export function RecommendationCard({
  title,
  description,
  address,
  phone,
  website,
  priceRange = 2,
  latitude,
  longitude,
  isFavorite,
}: RecommendationCardProps) {
  const openDirections = () => {
    if (latitude && longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank",
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm group"
    >
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              {title}
              {isFavorite && (
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              )}
            </h4>
            <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
              {description}
            </p>
          </div>
          <div className="flex text-xs font-medium text-neutral-400">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < priceRange ? "text-green-600 dark:text-green-400" : ""
                }
              >
                $
              </span>
            ))}
          </div>
        </div>

        {address && (
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{address}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={openDirections}
            className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Directions
          </button>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
