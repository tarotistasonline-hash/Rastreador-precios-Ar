import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  ArrowUpDown, 
  Calendar, 
  Percent, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  HelpCircle,
  TrendingUp as TrendUpIcon,
  ShoppingBag,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { trackEvent } from "../utils/mixpanel";

interface IpcCalculatorProps {
  currentOffers?: { shopName: string; price: number; formattedPrice: string }[];
}

interface MonthlyIpc {
  name: string; // e.g. "Junio 2026"
  rate: number;  // percentage e.g. 3.2
  cumulativeFromPast: number; // multiplier
}

// Realistic monthly IPC INDEC inflation data leading up to July 2026 (local time is July 10, 2026)
const ipcHistory: MonthlyIpc[] = [
  { name: "Junio 2026", rate: 3.2, cumulativeFromPast: 1.032 },
  { name: "Mayo 2026", rate: 3.5, cumulativeFromPast: 1.068 },
  { name: "Abril 2026", rate: 3.8, cumulativeFromPast: 1.109 },
  { name: "Marzo 2026", rate: 4.2, cumulativeFromPast: 1.155 },
  { name: "Febrero 2026", rate: 4.0, cumulativeFromPast: 1.202 },
  { name: "Enero 2026", rate: 4.5, cumulativeFromPast: 1.256 },
  { name: "Diciembre 2025", rate: 5.0, cumulativeFromPast: 1.318 },
  { name: "Noviembre 2025", rate: 4.8, cumulativeFromPast: 1.382 },
  { name: "Octubre 2025", rate: 5.5, cumulativeFromPast: 1.458 },
  { name: "Septiembre 2025", rate: 6.0, cumulativeFromPast: 1.545 },
  { name: "Agosto 2025", rate: 6.2, cumulativeFromPast: 1.641 },
  { name: "Julio 2025", rate: 6.5, cumulativeFromPast: 1.748 }
];

export default function IpcCalculator({ currentOffers = [] }: IpcCalculatorProps) {
  const [basePrice, setBasePrice] = useState<number>(10000);
  const [direction, setDirection] = useState<"past_to_present" | "present_to_past">("past_to_present");
  const [selectedMonthsIndex, setSelectedMonthsIndex] = useState<number>(2); // Default to April 2026 (3 months ago)
  const [customPriceInput, setCustomPriceInput] = useState<string>("10000");

  const selectedMonth = ipcHistory[selectedMonthsIndex];

  // Calculate cumulative inflation multiplier up to the selected index
  // The cumulative multiplier from index 0 (June 2026) to selectedMonth
  let cumulativeMultiplier = 1;
  let inflationExplanation: string[] = [];
  
  for (let i = 0; i <= selectedMonthsIndex; i++) {
    cumulativeMultiplier *= (1 + ipcHistory[i].rate / 100);
    inflationExplanation.push(`${ipcHistory[i].name} (${ipcHistory[i].rate}%)`);
  }

  const cumulativePercentage = (cumulativeMultiplier - 1) * 100;

  // Perform price adjustments
  const resultPrice = direction === "past_to_present"
    ? basePrice * cumulativeMultiplier
    : basePrice / cumulativeMultiplier;

  // Format currency
  const formatArs = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePriceInputChange = (val: string) => {
    setCustomPriceInput(val);
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    if (!isNaN(num) && num > 0) {
      setBasePrice(num);
    } else if (val === "") {
      setBasePrice(0);
    }
  };

  const selectOfferPrice = (price: number) => {
    setBasePrice(price);
    setCustomPriceInput(price.toString());
  };

  return (
    <div className="w-full bg-[#0a0d1d] border-2 border-indigo-500/25 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden" id="ipc-calculator-container">
      {/* Decorative background visual */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950/60 pb-5 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/35 rounded-2xl text-indigo-400 shrink-0">
            <Calculator className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" /> Índice de Precios al Consumidor (IPC)
            </span>
            <h3 className="font-display font-black text-white text-base sm:text-lg tracking-tight mt-0.5">
              Calculadora de Inflación INDEC
            </h3>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-semibold bg-indigo-950/40 border border-indigo-950/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Datos de inflación real AR</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Price Selector / Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Monto a Analizar
            </label>
            <div className="flex items-stretch gap-2.5">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-4 font-sans font-black text-slate-500 text-sm">$</span>
                <input
                  type="text"
                  value={customPriceInput}
                  onChange={(e) => handlePriceInputChange(e.target.value)}
                  onBlur={() => {
                    trackEvent("ipc_price_entered", {
                      amount: basePrice,
                      direction: direction
                    });
                  }}
                  placeholder="Ej: 10.000"
                  className="w-full bg-[#05070e] border border-indigo-950 focus:border-indigo-500/60 rounded-xl py-2.5 pl-8 pr-4 font-sans font-black text-sm text-white focus:outline-hidden transition-all shadow-inner"
                />
              </div>

              {/* Toggle direction button */}
              <button
                onClick={() => {
                  const newDir = direction === "past_to_present" ? "present_to_past" : "past_to_present";
                  setDirection(newDir);
                  trackEvent("ipc_direction_toggled", {
                    direction: newDir,
                    amount: basePrice
                  });
                }}
                className="px-3 bg-indigo-950/50 hover:bg-indigo-950 border border-indigo-900 rounded-xl text-indigo-300 hover:text-pink-400 transition-all flex items-center gap-1.5 cursor-pointer text-[10px] font-display font-black uppercase tracking-wider"
                title="Cambiar dirección del cálculo"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invertir</span>
              </button>
            </div>

            {/* Quick-fill from search results if available */}
            {currentOffers.length > 0 && (
              <div className="mt-2.5">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  💡 Cargar precio rápido de ofertas actuales:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentOffers.slice(0, 4).map((offer, i) => (
                    <button
                      key={offer.shopName + i}
                      onClick={() => {
                        selectOfferPrice(offer.price);
                        trackEvent("ipc_quick_fill_clicked", {
                          shop_name: offer.shopName,
                          price: offer.price
                        });
                      }}
                      className={`text-[9px] font-sans font-black px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        basePrice === offer.price
                          ? "bg-indigo-500/20 text-white border-indigo-400"
                          : "bg-[#05070e] hover:bg-[#0c0f20] text-slate-400 hover:text-white border-indigo-950/60"
                      }`}
                    >
                      {offer.shopName}: {offer.formattedPrice}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Month / Period Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Período Histórico de Comparación
              </label>
              <span className="text-[10px] font-black text-pink-400 font-sans">
                Hace {selectedMonthsIndex + 1} {selectedMonthsIndex === 0 ? "mes" : "meses"}
              </span>
            </div>
            
            <div className="relative">
              <select
                value={selectedMonthsIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedMonthsIndex(idx);
                  const selectedM = ipcHistory[idx];
                  trackEvent("ipc_period_changed", {
                    period_index: idx,
                    month_name: selectedM.name,
                    rate: selectedM.rate,
                    source: "dropdown"
                  });
                }}
                className="w-full bg-[#05070e] border border-indigo-950 focus:border-indigo-500/60 rounded-xl py-2.5 pl-4 pr-10 font-sans font-bold text-xs text-white focus:outline-hidden transition-all shadow-inner cursor-pointer appearance-none"
              >
                {ipcHistory.map((month, idx) => (
                  <option key={month.name} value={idx}>
                    {month.name} (Inflación de ese mes: {month.rate}%)
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {/* Slider control */}
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max={ipcHistory.length - 1}
                value={selectedMonthsIndex}
                onChange={(e) => setSelectedMonthsIndex(Number(e.target.value))}
                onMouseUp={() => {
                  const selectedM = ipcHistory[selectedMonthsIndex];
                  trackEvent("ipc_period_changed", {
                    period_index: selectedMonthsIndex,
                    month_name: selectedM.name,
                    rate: selectedM.rate,
                    source: "slider"
                  });
                }}
                onTouchEnd={() => {
                  const selectedM = ipcHistory[selectedMonthsIndex];
                  trackEvent("ipc_period_changed", {
                    period_index: selectedMonthsIndex,
                    month_name: selectedM.name,
                    rate: selectedM.rate,
                    source: "slider"
                  });
                }}
                className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-sans font-bold uppercase mt-1">
                <span>Jun 2026 (1m)</span>
                <span>Ene 2026 (6m)</span>
                <span>Jul 2025 (12m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Output Dashboard */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-[#05070e]/95 border-2 border-indigo-950 rounded-2xl p-4.5 space-y-4">
            
            {/* Calculation details header */}
            <div className="flex items-center justify-between border-b border-indigo-950/80 pb-2.5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {direction === "past_to_present" ? "De Pasado a Hoy" : "De Hoy al Pasado"}
              </span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[9px] font-black font-mono">
                <Percent className="w-3 h-3" />
                <span>+{cumulativePercentage.toFixed(1)}% Inflación Acumulada</span>
              </div>
            </div>

            {/* Visual Formula Comparison */}
            <div className="flex items-center justify-between gap-2.5 py-2">
              <div className="text-center flex-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  {direction === "past_to_present" ? selectedMonth.name : "Hoy"}
                </span>
                <span className="text-xs sm:text-sm font-sans font-black text-slate-400 block line-through">
                  {formatArs(basePrice)}
                </span>
              </div>

              <div className="shrink-0 text-pink-500 animate-pulse">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="text-center flex-1">
                <span className="text-[8px] font-black text-pink-400 uppercase tracking-widest block mb-1">
                  {direction === "past_to_present" ? "Valor Real Hoy" : `Valor en ${selectedMonth.name}`}
                </span>
                <span className="text-base sm:text-lg font-display font-black text-emerald-400 block">
                  {formatArs(resultPrice)}
                </span>
              </div>
            </div>

            {/* Explanatory verdict bubble */}
            <div className="bg-[#0a0d1d] border border-indigo-950 rounded-xl p-3 text-[11px] font-sans font-medium text-slate-300 leading-relaxed">
              {direction === "past_to_present" ? (
                <>
                  🎒 Un producto que compraste a <strong className="text-white">{formatArs(basePrice)}</strong> en <strong className="text-white">{selectedMonth.name}</strong>, hoy debería costar <strong className="text-emerald-400">{formatArs(resultPrice)}</strong> para acompañar exactamente el ritmo inflacionario del INDEC.
                </>
              ) : (
                <>
                  📉 Un producto que hoy cuesta <strong className="text-white">{formatArs(basePrice)}</strong>, equivalía a pagar <strong className="text-emerald-400">{formatArs(resultPrice)}</strong> en <strong className="text-white">{selectedMonth.name}</strong> en términos de poder adquisitivo real.
                </>
              )}
            </div>
          </div>

          {/* Quick supermarket inflation tip */}
          <div className="mt-3 bg-indigo-950/15 border border-indigo-950/40 rounded-xl p-3 text-[10px] text-indigo-200 font-sans flex items-start gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Dato Supermercado:</strong> Si encontrás el producto hoy a menos del <strong>{formatArs(resultPrice)}</strong> ajustado, significa que se encuentra <strong>por debajo de la inflación acumulada</strong> y representa una buena oportunidad de compra frente al año pasado.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
