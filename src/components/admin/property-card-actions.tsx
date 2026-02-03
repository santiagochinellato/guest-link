"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Edit, Trash2, Eye, Loader2, AlertTriangle } from "lucide-react";
import { deleteProperty } from "@/lib/actions/properties";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PropertyCardActionsProps {
  propertyId: number;
  slug: string;
}

export function PropertyCardActions({
  propertyId,
  slug,
}: PropertyCardActionsProps) {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || "es";
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProperty(propertyId);
      if (!res.success) {
        toast.error(res.error || "Error al eliminar la propiedad");
        setIsDeleting(false);
      } else {
        toast.success("Propiedad eliminada correctamente");
        router.refresh();
      }
    } catch {
      toast.error("Ocurrió un error inesperado al eliminar.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/${lang}/dashboard/properties/${propertyId}/edit`}
          onClick={() => setIsEditLoading(true)}
          className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-brand-void hover:text-white dark:hover:bg-white dark:hover:text-brand-void transition-colors flex items-center gap-2 shadow-sm"
          title="Edit Property"
        >
          {isEditLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Edit className="w-4 h-4" />
          )}
          <p className="text-xs font-medium hidden md:inline">
            {isEditLoading ? "Cargando..." : "Editar"}
          </p>
        </Link>
        <button
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
          className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          title="Delete Property"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <p className="text-xs font-medium hidden md:inline">Eliminar</p>
        </button>
        <Link
          href={`/${lang}/stay/${slug}`}
          target="_blank"
          className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-brand-copper hover:text-white dark:hover:bg-brand-copper dark:hover:text-white transition-colors flex items-center gap-2 shadow-sm"
          title="View as Guest"
        >
          <Eye className="w-4 h-4" />
          <p className="text-[12px] font-medium hidden md:inline">
            Vista del huésped
          </p>
        </Link>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription className="pt-2">
              ¿Estás seguro de que quieres eliminar esta propiedad? Esta acción
              no se puede deshacer y perderás todos los datos asociados
              (recomendaciones, guías, configuraciones).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Eliminar Propiedad
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
