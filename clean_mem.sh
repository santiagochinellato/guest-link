#!/bin/bash

# Mostrar memoria actual
echo "----------------------------------------"
echo "📊 Memoria ANTES de limpiar:"
free -h
echo "----------------------------------------"

# Limpiar caché (requiere sudo)
echo "🧹 Limpiando PageCache, dentries y inodes..."
# Sincronizar datos al disco primero para seguridad
sync
# Liberar caches
if sudo sysctl -w vm.drop_caches=3; then
    echo "✅ Caché liberada exitosamente."
else
    echo "❌ Error al intentar liberar caché. Asegurate de tener permisos de sudo."
fi

echo "----------------------------------------"
echo "✨ Memoria DESPUÉS de limpiar:"
free -h
echo "----------------------------------------"
