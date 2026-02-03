"use client";

import { useFormContext } from "react-hook-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Star, Users } from "lucide-react";

interface CuratorModalProps {
  editingIndex: number | null;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
}

export function CuratorModal({
  editingIndex,
  onClose,
  item,
}: CuratorModalProps) {
  const { register } = useFormContext();

  if (!item) return null;

  return (
    <Dialog
      open={editingIndex !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        {/* Header Visual */}
        <div className="h-32 bg-gray-100 relative flex items-center justify-center">
          <MapPin className="w-10 h-10 text-gray-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <h3 className="text-white font-bold text-lg leading-tight">
              {item.title}
            </h3>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Ratings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-lg">
                {item.rating || "--"} <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                Google
              </p>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-lg">
                New <Users className="w-4 h-4" />
              </div>
              <p className="text-[10px] uppercase text-blue-400 font-bold tracking-wider">
                Guest Score
              </p>
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Tu reseña personal
            </Label>
            <Textarea
              {...register(
                `recommendations.${editingIndex as number}.description`,
              )}
              placeholder="¿Por qué recomiendas este lugar? (Ej: 'Tienen las mejores medialunas')"
              className="resize-none h-24 text-sm bg-gray-50 border-gray-200 focus-visible:ring-brand-copper/20"
            />
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-brand-void text-white hover:bg-brand-void/90"
          >
            Guardar Reseña
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
