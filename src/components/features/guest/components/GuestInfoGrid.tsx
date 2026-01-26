import { Clock } from "lucide-react";

interface GuestInfoGridProps {
  checkIn?: string;
  checkOut?: string;
}

export function GuestInfoGrid({ checkIn, checkOut }: GuestInfoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-3">
        <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wider">
            Check-in
          </p>
          <p className="text-neutral-900 dark:text-white font-bold text-xl">
            {checkIn || "11:00 AM"}
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-3">
        <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wider">
            Check-out
          </p>
          <p className="text-neutral-900 dark:text-white font-bold text-xl">
            {checkOut || "11:00 AM"}
          </p>
        </div>
      </div>
    </div>
  );
}
