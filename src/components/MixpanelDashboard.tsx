import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart2, 
  X, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Trash2, 
  Send, 
  Info, 
  ExternalLink, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { trackEvent } from "../utils/mixpanel";

interface MixpanelDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LocalEvent {
  id: string;
  event: string;
  timestamp: string;
  properties: Record<string, any>;
}

export default function MixpanelDashboard({ isOpen, onClose }: MixpanelDashboardProps) {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Read Mixpanel Token from Vite environment
  const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN || "";
  const isRealTokenActive = mixpanelToken && mixpanelToken.trim() !== "";

  // Helper to load events from localStorage
  const loadLocalEvents = () => {
    try {
      const saved = localStorage.getItem("mixpanel_local_events");
      if (saved) {
        setEvents(JSON.parse(saved));
      } else {
        setEvents([]);
      }
    } catch (e) {
      console.error("Error loading local mixpanel events:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLocalEvents();
    }

    // Listen to live events dispatched by trackEvent helper
    const handleEventTracked = () => {
      loadLocalEvents();
    };

    window.addEventListener("mixpanel_event_tracked", handleEventTracked);
    return () => {
      window.removeEventListener("mixpanel_event_tracked", handleEventTracked);
    };
  }, [isOpen]);

  // Handle triggering a test event
  const handleTriggerTestEvent = () => {
    const testProps = {
      test_source: "Mixpanel In-App Console",
      user_action: "Interactive Test Click",
      timestamp: new Date().toISOString()
    };
    trackEvent("test_event_triggered", testProps);
    
    setNotification("¡Evento de prueba enviado!");
    setTimeout(() => setNotification(null), 3000);
  };

  // Clear tracked events list
  const handleClearLogs = () => {
    try {
      localStorage.removeItem("mixpanel_local_events");
      setEvents([]);
      trackEvent("telemetry_logs_cleared", { cleared_at: new Date().toISOString() });
      setNotification("Logs de telemetría borrados");
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error("Error clearing logs:", e);
    }
  };

  const toggleExpandEvent = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  // Calculate event statistics
  const totalEventsCount = events.length;
  
  // Calculate category distribution
  const eventCategoryCounts = events.reduce((acc, ev) => {
    let category = "Otros";
    if (ev.event.includes("search")) category = "Búsquedas";
    else if (ev.event.includes("alert")) category = "Alertas de Precio";
    else if (ev.event.includes("compare")) category = "Comparador";
    else if (ev.event.includes("savings")) category = "Ahorros";
    else if (ev.event.includes("session")) category = "Sesión";
    
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(eventCategoryCounts).sort((a, b) => (b[1] as number) - (a[1] as number));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 cursor-pointer"
            id="mixpanel-dashboard-backdrop"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0A0D1A] border-l border-slate-800/80 shadow-2xl z-50 flex flex-col font-sans text-slate-100 overflow-hidden"
            id="mixpanel-dashboard-panel"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 bg-[#0C1024] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 text-white p-2 rounded-xl shadow-lg shadow-purple-500/20">
                  <BarChart2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
                    Consola de Métricas Mixpanel
                  </h3>
                  <p className="text-[11px] text-indigo-200/50">
                    Monitoreo de Telemetría en Tiempo Real
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 p-2 rounded-xl transition-all cursor-pointer"
                id="mixpanel-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Integration Status Card */}
              <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-purple-500/5 rounded-full blur-xl" />
                
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest block">
                      Estado de la Integración
                    </span>
                    <h4 className="font-bold text-sm text-slate-200">
                      {isRealTokenActive ? "Conexión Activa con Mixpanel" : "Modo Simulación / Desarrollo"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {isRealTokenActive 
                        ? `Los eventos se están enviando exitosamente a tu cuenta de Mixpanel (Token: ${mixpanelToken.substring(0, 6)}***).`
                        : "No se detectó un Token de Mixpanel. Los eventos se registran localmente en la consola y se visualizan en este panel dinámico."}
                    </p>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold shrink-0 shadow-sm ${
                    isRealTokenActive 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30" 
                      : "bg-amber-950/40 text-amber-400 border-amber-500/30"
                  }`}>
                    {isRealTokenActive ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>VIVO / PRODUCCIÓN</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>SIMULADO</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Info block if token is simulated */}
                {!isRealTokenActive && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-800/60 flex items-start gap-2 text-[11px] text-slate-400">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span>Puedes conectar tu propia cuenta gratuita de Mixpanel definiendo la variable de entorno <strong>VITE_MIXPANEL_TOKEN</strong> en el panel de configuración de secretos de AI Studio.</span>
                      <a 
                        href="https://mixpanel.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 ml-1 text-purple-400 hover:text-purple-300 underline font-semibold transition-colors"
                      >
                        Crear Mixpanel gratis <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Counters Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0C1024] border border-indigo-950/50 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Total Eventos</span>
                    <Database className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-2xl font-black font-display text-white">
                      {totalEventsCount}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">guardados en caché local</span>
                  </div>
                </div>

                <div className="bg-[#0C1024] border border-indigo-950/50 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Probar Tracking</span>
                    <Send className="w-4 h-4 text-indigo-400" />
                  </div>
                  <button
                    onClick={handleTriggerTestEvent}
                    className="mt-2 text-left w-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Enviar Evento Test
                  </button>
                </div>
              </div>

              {/* Notifications */}
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="font-medium">{notification}</span>
                </motion.div>
              )}

              {/* Category Breakdown (Dynamic chart built in pure CSS/Tailwind) */}
              <div className="bg-slate-900/40 border border-slate-800/40 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-purple-400" />
                    Distribución por Categorías
                  </h4>
                  {totalEventsCount > 0 && (
                    <button
                      onClick={handleClearLogs}
                      className="text-[11px] font-bold text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Borrar logs acumulados"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpiar Logs
                    </button>
                  )}
                </div>

                {totalEventsCount === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500 font-medium">
                    Sin datos. Navega por el sitio o haz una búsqueda para registrar eventos.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedCategories.map(([category, count]) => {
                      const percentage = Math.round(((count as number) / totalEventsCount) * 100);
                      let barColor = "bg-purple-500";
                      if (category === "Búsquedas") barColor = "bg-cyan-500";
                      else if (category === "Alertas de Precio") barColor = "bg-rose-500";
                      else if (category === "Comparador") barColor = "bg-amber-500";
                      else if (category === "Ahorros") barColor = "bg-emerald-500";

                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300">{category}</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className={`h-full ${barColor} rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Real-time Event Feed */}
              <div className="space-y-3">
                <h4 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider">
                  Historial de Eventos Recientes
                </h4>

                {events.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500 leading-relaxed">
                    <Activity className="w-8 h-8 mx-auto text-slate-700 mb-3 animate-pulse" />
                    <span>Aún no se han capturado eventos en esta sesión.<br />Haz búsquedas, activa filtros o agrega alertas para ver el flujo en vivo.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {events.map((ev) => {
                      const isExpanded = expandedEventId === ev.id;
                      const timeStr = new Date(ev.timestamp).toLocaleTimeString();
                      
                      // Identify event colors for clean styling
                      let tagColor = "border-purple-500/25 text-purple-400 bg-purple-500/5";
                      if (ev.event.includes("search")) {
                        tagColor = "border-cyan-500/25 text-cyan-400 bg-cyan-500/5";
                      } else if (ev.event.includes("alert")) {
                        tagColor = "border-rose-500/25 text-rose-400 bg-rose-500/5";
                      } else if (ev.event.includes("compare")) {
                        tagColor = "border-amber-500/25 text-amber-400 bg-amber-500/5";
                      }

                      return (
                        <div 
                          key={ev.id} 
                          className="bg-slate-900/40 border border-slate-800/50 rounded-xl overflow-hidden transition-all hover:bg-slate-900/60"
                        >
                          <div 
                            onClick={() => toggleExpandEvent(ev.id)}
                            className="p-3 flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-mono font-medium shrink-0">
                                {timeStr}
                              </span>
                              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 border rounded-lg ${tagColor}`}>
                                {ev.event}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {Object.keys(ev.properties || {}).length} props
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </div>
                          </div>

                          {/* Collapse details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-slate-850 bg-[#060813] p-3 text-left overflow-x-auto"
                              >
                                <pre className="text-[10px] text-indigo-300 font-mono leading-relaxed whitespace-pre-wrap">
                                  {JSON.stringify(ev.properties, null, 2)}
                                </pre>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800/80 bg-[#070914] text-center text-[10px] text-slate-500">
              Integración certificada con Mixpanel SDK • {isRealTokenActive ? "Vía Red de Datos" : "Modo Debugger"}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
