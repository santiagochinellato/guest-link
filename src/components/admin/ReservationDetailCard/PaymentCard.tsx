"use client";

import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentCardProps {
  total: number;
  localAmountPaid: number;
  pending: number;
  currency: string;
  showPaymentInput: boolean;
  paymentInputValue: string;
  setPaymentInputValue: (v: string) => void;
  isUpdatingPayment: boolean;
  onShowInput: () => void;
  onUpdatePayment: () => void;
}

export function PaymentCard({
  total,
  localAmountPaid,
  pending,
  currency,
  showPaymentInput,
  paymentInputValue,
  setPaymentInputValue,
  isUpdatingPayment,
  onShowInput,
  onUpdatePayment,
}: PaymentCardProps) {
  return (
    <div
      className={cn(
        "xl:row-span-2 rounded-2xl p-6 flex flex-col",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
        "border border-white/50 dark:border-slate-800",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pagos</h3>
      </div>

      <div className="space-y-4 flex-1">
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Total reserva
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {total} <span className="text-lg font-normal text-slate-500">{currency}</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 border border-emerald-200 dark:border-emerald-700">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
            Pagado
          </p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {localAmountPaid} <span className="text-lg font-normal text-emerald-600 dark:text-emerald-500">{currency}</span>
          </p>
          {localAmountPaid > 0 && total > 0 && (
            <div className="mt-3">
              <div className="h-1.5 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (localAmountPaid / total) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 border border-amber-200 dark:border-amber-700">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
            Pendiente
          </p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {pending} <span className="text-lg font-normal text-amber-600 dark:text-amber-500">{currency}</span>
          </p>
        </div>
      </div>

      <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-700">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
          Actualizar monto pagado
        </label>
        {showPaymentInput ? (
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={paymentInputValue}
              onChange={(e) => setPaymentInputValue(e.target.value)}
              placeholder="0"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              size="sm"
              onClick={onUpdatePayment}
              disabled={isUpdatingPayment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdatingPayment ? "..." : "Actualizar"}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
            onClick={onShowInput}
          >
            {localAmountPaid > 0 ? `${localAmountPaid} ${currency}` : "Registrar pago"}
          </Button>
        )}
      </div>
    </div>
  );
}

