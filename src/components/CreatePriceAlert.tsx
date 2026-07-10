import React, { useState, useEffect } from "react";
import { Bell, Sparkles, AlertCircle, CheckCircle, TrendingDown, Percent } from "lucide-react";
import { PriceAlert } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CreatePriceAlertProps {
  productName: string;
  currentLowestPrice: number;
  storeName: string;
  onCreateAlert: (targetPrice: number) => void;
  existingAlerts: PriceAlert[];
  marketAveragePrice?: number;
}

export default function CreatePriceAlert({
  productName,
  currentLowestPrice,
  storeName,
  onCreateAlert,
  existingAlerts,
  marketAveragePrice,
}: CreatePriceAlertProps) {
  const [targetPriceInput, setTargetPriceInput] = useState("");
  const [success, setSuccess] = useState(false);

  // Check if there's already an active alert for this product name (case-insensitive substring check or exact match)
  const existingAlert = existingAlerts.find(
    (alert) => alert.productName.toLowerCase() === productName.toLowerCase()
  );

  // Default suggestions
  const discount10 = Math.round(currentLowestPrice * 0.9);
  const discount15 = Math.round(currentLowestPrice * 0.85);

  const cleanVal = targetPriceInput.replace(/[^0-9]/g, "");
  const targetPrice = Number(cleanVal);
  const averagePrice = marketAveragePrice || currentLowestPrice * 1.25;

  const isUnrealisticallyLow = targetPrice > 0 && (
    targetPrice < currentLowestPrice * 0.6 || 
    targetPrice < averagePrice * 0.5
  );

  const discountPercentOffAverage = averagePrice > 0 
    ? Math.round(((averagePrice - targetPrice) / averagePrice) * 100) 
    : 0;

  useEffect(() => {
    // Pre-fill target input with a 10% discount as default suggestion
    setTargetPriceInput(String(discount10));
    setSuccess(false);
  }, [productName, currentLowestPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = targetPriceInput.replace(/[^0-9]/g, "");
    const targetVal = Number(cleanVal);

    if (targetVal > 0) {
      onCreateAlert(targetVal);
      setSuccess(true);
      // Let success state reset after a while
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const handleApplyDiscount = (price: number) => {
    setTargetPriceInput(String(price));
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-950/20 via-[#0e1329] to-pink-950/15 border-2 border-indigo-500/25 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden" id="create-price-alert-card">
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 rounded-2xl text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)] shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-pink-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> ¡AVISAME CUANDO BAJE!
            </span>
            <h3 className="font-display font-black text-white text-base tracking-tight sm:text-lg">
              Alerta de Precio Inteligente
            </h3>
          </div>
        </div>

        {existingAlert ? (
          <div className="bg-pink-500/10 text-pink-300 border border-pink-500/35 px-3 py-1.5 rounded-xl text-xs font-sans font-black tracking-wide flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Alerta Configurada: ${existingAlert.targetPrice.toLocaleString("es-AR")}</span>
          </div>
        ) : (
          <div className="bg-slate-900 border border-indigo-950 px-3 py-1.5 rounded-xl text-xs font-sans font-bold text-slate-400">
            Hoy más bajo: <span className="text-white font-mono font-black">${currentLowestPrice.toLocaleString("es-AR")}</span> en <strong className="text-indigo-300">{storeName}</strong>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-medium mb-5">
        Establecé tu precio objetivo para <strong className="text-white font-bold">"{productName}"</strong>. Cuando los rastreadores detecten que el producto cuesta menos de tu umbral en cualquier súper, se disparará una alerta privada de forma instantánea.
      </p>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 text-emerald-300 shadow-xl"
        >
          <CheckCircle className="w-5 h-5 animate-pulse shrink-0" />
          <div className="text-xs font-semibold leading-relaxed">
            <h4 className="font-black text-emerald-400 uppercase tracking-wide text-[10px] mb-0.5">¡Alerta creada correctamente!</h4>
            La guardamos de forma privada en tu LocalStorage. Te avisaremos cuando baje de <strong className="text-white font-mono font-black">${Number(targetPriceInput).toLocaleString("es-AR")}</strong>.
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {isUnrealisticallyLow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-amber-200 text-xs flex items-start gap-3 shadow-lg shadow-amber-500/5 overflow-hidden"
              >
                <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block">
                    ⚠️ Alerta de Viabilidad de Precio
                  </span>
                  <p className="leading-relaxed font-semibold">
                    El precio objetivo de <strong className="text-white">${targetPrice.toLocaleString("es-AR")}</strong> es extremadamente bajo (un <strong className="text-white">{discountPercentOffAverage}% por debajo</strong> del promedio de mercado de <strong className="text-white">${Math.round(averagePrice).toLocaleString("es-AR")}</strong>).
                  </p>
                  <p className="text-[11px] text-amber-300/80 leading-relaxed font-medium">
                    Aunque guardaremos la alerta, es poco probable que este producto alcance este valor de forma habitual, salvo por promociones extremas de liquidación o errores de facturación.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 bg-slate-950/40 p-4 rounded-2xl border border-indigo-950/80">
            {/* Target Price input */}
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="target-price-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Precio Objetivo ($ ARS)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4.5 font-display font-black text-slate-400 text-lg">$</span>
                <input
                  id="target-price-input"
                  type="text"
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Ej. 3500"
                  className="w-full bg-[#060810] border border-indigo-950 focus:border-pink-500/60 rounded-xl py-3 pl-10 pr-4 font-display font-black text-lg text-white focus:outline-hidden transition-all shadow-inner focus:shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                  required
                />
              </div>
            </div>

            {/* Quick discounts suggestions */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Sugerencias de Rebaja
              </span>
              <div className="flex gap-2 h-12.5 items-center">
                <button
                  type="button"
                  onClick={() => handleApplyDiscount(discount10)}
                  className={`px-3 py-2 rounded-xl text-xs font-display font-black tracking-wide border transition-all flex items-center gap-1.5 cursor-pointer ${
                    Number(targetPriceInput) === discount10
                      ? "bg-pink-500/20 border-pink-500 text-pink-300"
                      : "bg-[#060810] border-indigo-950 text-slate-300 hover:border-indigo-500/50 hover:bg-[#111425]"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>-10% (${discount10.toLocaleString("es-AR")})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDiscount(discount15)}
                  className={`px-3 py-2 rounded-xl text-xs font-display font-black tracking-wide border transition-all flex items-center gap-1.5 cursor-pointer ${
                    Number(targetPriceInput) === discount15
                      ? "bg-pink-500/20 border-pink-500 text-pink-300"
                      : "bg-[#060810] border-indigo-950 text-slate-300 hover:border-indigo-500/50 hover:bg-[#111425]"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>-15% (${discount15.toLocaleString("es-AR")})</span>
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              id="create-alert-submit-btn"
              className="h-12.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-display font-black text-xs uppercase tracking-wider transition-all hover:scale-102 active:scale-98 shadow-md shadow-pink-500/10 hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>{existingAlert ? "Actualizar Alerta" : "Activar Alerta"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
