import { Clock, KeyRound, LogOut } from "lucide-react";

interface CheckInOutCardProps {
  checkIn: string;
  checkOut: string;
  labels: {
    checkIn: string;
    checkOut: string;
    from: string;
    until: string;
  };
}

export function CheckInOutCard({
  checkIn,
  checkOut,
  labels,
}: CheckInOutCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          Timings
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-wider mb-1">
            <KeyRound className="w-3 h-3" />
            {labels.checkIn}
          </div>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">
            {checkIn}
          </p>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-wider mb-1">
            <LogOut className="w-3 h-3" />
            {labels.checkOut}
          </div>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">
            {checkOut}
          </p>
        </div>
      </div>
    </div>
  );
}
