import { Clock } from "lucide-react";

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
    <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-center h-full">
      <div className="flex items-center gap-2 mb-4 text-neutral-500 dark:text-neutral-400">
        <Clock className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Status
        </span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white leading-none mb-1">
            {checkIn}
          </p>
          <p className="text-xs text-neutral-500 font-medium">
            {labels.checkIn}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-neutral-400 dark:text-neutral-600 leading-none mb-1">
            {checkOut}
          </p>
          <p className="text-xs text-neutral-500 font-medium">
            {labels.checkOut}
          </p>
        </div>
      </div>
    </div>
  );
}
