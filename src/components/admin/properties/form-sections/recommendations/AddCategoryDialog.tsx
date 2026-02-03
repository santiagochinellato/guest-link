"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Utensils,
  Camera,
  ShoppingBag,
  Beer,
  Baby,
  Mountain,
  Navigation,
  MapPin,
  Star,
} from "lucide-react";

const ICONS_MAP: Record<string, React.ElementType> = {
  Utensils,
  Camera,
  ShoppingBag,
  Beer,
  Baby,
  Mountain,
  Navigation,
  MapPin,
  Star,
};

interface AddCategoryDialogProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (cat: any) => void;
}

export function AddCategoryDialog({ children, onAdd }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Star");
  const [keywords, setKeywords] = useState("");

  const handleSubmit = () => {
    if (!name) return;
    // Generate simple slug
    const type = name.toLowerCase().replace(/\s+/g, "-");
    onAdd({ name, type, icon, searchKeywords: keywords });
    setOpen(false);
    setName("");
    setKeywords("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej. Cafeterías de Especialidad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Palabras Clave (para búsqueda)</Label>
            <Input
              placeholder="Ej. coffee, espresso, latte"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Icono</Label>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(ICONS_MAP).map((key) => {
                const I = ICONS_MAP[key];
                return (
                  <button
                    key={key}
                    onClick={() => setIcon(key)}
                    className={cn(
                      "p-2 rounded-md border transition-all",
                      icon === key
                        ? "bg-brand-void text-white border-brand-void"
                        : "hover:bg-gray-100",
                    )}
                  >
                    <I className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Crear Categoría</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
