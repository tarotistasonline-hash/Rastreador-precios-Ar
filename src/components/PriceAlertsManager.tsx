import { useState, useEffect } from "react";
import { Bell, Trash2, RefreshCw, TrendingDown, Clock, Check, X, AlertTriangle, Sparkles, BellOff, ArrowDown } from "lucide-react";
import { PriceAlert } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { trackEvent } from "../utils/mixpanel";

interface PriceAlertsManagerProps {
  alerts: PriceAlert[];
  onDeleteAlert: (id: string) => void;
  onRefreshAlerts: () => Promise<void>;
  isRefreshing: boolean;
  onMarkAsRead: (id: string) => void;
}

export default function PriceAlertsManager({
  alerts,
  onDeleteAlert,
  onRefreshAlerts,
  isRefreshing,
  onMarkAsRead,
}: PriceAlertsManagerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "triggered">("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "active") return !alert.isTriggered;
    if (activeTab === "triggered") return alert.isTriggered;
    return true;
  });

  const activeCount = alerts.filter((a) => !a.isTriggered).length;
  const triggeredCount = alerts.filter((a) => a.isTriggered).length;

  return (
    <div className="w-full bg-gradient-to-b from-[#13172E] to-[#0D1021] border-2 border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/35 relative overflow-hidden" id="price-alerts-manager">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950/60 pb-5 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-500/10 border border-pink-500/35 rounded-2xl text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)] animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-lg tracking-tight flex items-center gap-2">
              Mis Alertas de Precios AR
              <span className="text-[10px] bg-pink-500 text-white font-sans font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                Beta
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Rastreo inteligente en segundo plano. Te notificamos si baja del objetivo.
            </p>
          </div>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={onRefreshAlerts}
            disabled={isRefreshing}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-500/40 font-display font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
              isRefreshing ? "animate-pulse" : ""
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Verificando..." : "Verificar Precios"}</span>
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="py-8 text-center max-w-sm mx-auto flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 bg-slate-950/80 rounded-2xl flex items-center justify-center border border-indigo-500/10 text-slate-500 mb-4 shadow-inner">
            <BellOff className="w-8 h-8" />
          </div>
          <h4 className="font-display font-bold text-slate-200 text-sm">No tenés alertas configuradas</h4>
          <p className="text-slate-400 text-xs mt-2 font-sans leading-relaxed">
            Buscá cualquier producto arriba (ej. <span className="text-pink-400 font-semibold font-mono">Yerba Mate</span>) y hacé clic en el botón <strong className="text-slate-300">"Crear Alerta de Precio"</strong> para recibir avisos de rebajas.
          </p>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4 bg-slate-950/40 p-1 rounded-xl border border-indigo-950/80">
            <button
              onClick={() => {
                setActiveTab("all");
                trackEvent("price_alerts_tab_changed", { tab: "all" });
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-display font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todas ({alerts.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("active");
                trackEvent("price_alerts_tab_changed", { tab: "active" });
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-display font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Activas ({activeCount})
            </button>
            <button
              onClick={() => {
                setActiveTab("triggered");
                trackEvent("price_alerts_tab_changed", { tab: "triggered" });
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-display font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "triggered"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Rebajadas ({triggeredCount})
            </button>
          </div>

          {/* Alerts List */}
          <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs font-sans">
                  No hay alertas en esta categoría.
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const isTriggered = alert.isTriggered;
                  const discountPct = Math.round(
                    ((alert.initialPrice - alert.currentLowestPrice) / alert.initialPrice) * 100
                  );

                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                        isTriggered
                          ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-950/10"
                          : "bg-[#090C16] border-indigo-950 hover:border-indigo-500/30"
                      }`}
                    >
                      {/* Product & Store info */}
                      <div className="flex-1 min-w-0 flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                            isTriggered
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-indigo-500/5 border-indigo-500/10 text-indigo-400"
                          }`}
                        >
                          {isTriggered ? (
                            <TrendingDown className="w-4 h-4 animate-bounce" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-sans font-bold text-white text-sm truncate flex items-center gap-2">
                            {alert.productName}
                            {isTriggered && (
                              <span className="bg-emerald-500 text-slate-950 font-display font-black text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-md animate-pulse shrink-0">
                                🔥 ¡OFERTA!
                              </span>
                            )}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-slate-400">
                            <span className="font-medium">
                              Creada: <strong className="text-slate-300 font-mono">{alert.createdAt}</strong>
                            </span>
                            <span className="text-slate-600">•</span>
                            <span>
                              Tienda actual:{" "}
                              <strong className="text-indigo-300 font-semibold">{alert.storeName}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Comparison Segment */}
                      <div className="flex items-center gap-4 border-t border-indigo-950/40 md:border-t-0 pt-3 md:pt-0 shrink-0">
                        <div className="grid grid-cols-3 md:flex md:items-center gap-4 text-center md:text-right">
                          {/* Initial Price */}
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
                              Inicial
                            </span>
                            <span className="font-mono text-xs text-slate-400 line-through mt-0.5">
                              ${alert.initialPrice.toLocaleString("es-AR")}
                            </span>
                          </div>

                          {/* Target Price */}
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
                              Objetivo
                            </span>
                            <span className="font-mono text-xs text-pink-400 font-black mt-0.5">
                              ${alert.targetPrice.toLocaleString("es-AR")}
                            </span>
                          </div>

                          {/* Current Price */}
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
                              Actual
                            </span>
                            <span
                              className={`font-mono text-sm font-black mt-0.5 ${
                                isTriggered ? "text-emerald-400 animate-pulse" : "text-slate-200"
                              }`}
                            >
                              ${alert.currentLowestPrice.toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>

                        {/* Interactive discount badge */}
                        {isTriggered && discountPct > 0 && (
                          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-xl text-xs font-display font-black tracking-wide flex items-center gap-0.5 shrink-0">
                            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{discountPct}% OFF</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 pl-2 shrink-0">
                          {isTriggered && !alert.isRead && (
                            <button
                              onClick={() => onMarkAsRead(alert.id)}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteAlert(alert.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Eliminar Alerta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
