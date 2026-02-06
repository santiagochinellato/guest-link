"use client";

import { Eye, Clock, Smartphone, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PropertyAnalytics } from "@/types/analytics";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PropertyAnalyticsViewProps {
  analytics: PropertyAnalytics;
  propertyId: number;
}

function formatTime(seconds: number): string {
  if (seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PropertyAnalyticsView({
  analytics,
  propertyId,
}: PropertyAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Vistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-brand-void dark:text-white">
                  {analytics.totalViews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tiempo Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-brand-void dark:text-white">
                  {formatTime(analytics.avgTimeOnPage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              % Mobile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-brand-void dark:text-white">
                  {analytics.mobilePercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Acciones Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-copper/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-brand-copper" />
              </div>
              <div>
                <p className="text-3xl font-bold text-brand-void dark:text-white">
                  {analytics.topActions.reduce((sum, a) => sum + a.count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Actions */}
      {analytics.topActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones Más Comunes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topActions.map((action) => (
                <div
                  key={action.action}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800"
                >
                  <span className="font-medium text-brand-void dark:text-white">
                    {action.action}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {action.count} veces
                    </span>
                    <Badge variant="secondary">{action.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Recommendations */}
      {analytics.topRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topRecommendations.map((rec, index) => (
                <div
                  key={`${rec.name}-${index}`}
                  className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-brand-void dark:text-white">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-brand-void dark:text-white truncate">
                          {rec.name}
                        </h4>
                        {rec.rating && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {rec.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{rec.category}</span>
                        {rec.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {rec.address}
                          </span>
                        )}
                        {rec.priceRange && (
                          <span>
                            {"$".repeat(rec.priceRange)}
                            {"$".repeat(4 - rec.priceRange)}
                          </span>
                        )}
                      </div>
                      {rec.firstClicked && rec.lastClicked && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Primera vez: {format(new Date(rec.firstClicked), "d MMM yyyy", { locale: es })} • 
                          Última vez: {format(new Date(rec.lastClicked), "d MMM yyyy", { locale: es })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-copper">
                        {rec.clicks}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        clicks
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Views Timeline */}
      {analytics.viewsTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vistas por Día (Últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.viewsTimeline.map((item) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {format(new Date(item.date), "EEEE, d MMM", { locale: es })}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-copper rounded-full transition-all"
                        style={{
                          width: `${
                            (item.views /
                              Math.max(
                                ...analytics.viewsTimeline.map((i) => i.views),
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-brand-void dark:text-white w-8 text-right">
                      {item.views}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {analytics.totalViews === 0 &&
        analytics.topActions.length === 0 &&
        analytics.topRecommendations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400">
                Aún no hay datos de analytics para esta propiedad
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Los datos aparecerán cuando los huéspedes visiten la guía
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
