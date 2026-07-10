import React, { useState } from "react";
import { TrendingDown, PiggyBank, Sparkles, ShoppingBag, HelpCircle, ArrowRight, Percent, Layers } from "lucide-react";
import { motion } from "motion/react";

interface Offer {
  shopName: string;
  price?: number;
  formattedPrice: string;
  isBestDeal?: boolean;
}

interface PotentialSavingsProps {
  offers: Offer[];
  productName: string;
}

export default function PotentialSavings({ offers, productName }: PotentialSavingsProps) {
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(3); // Default estimate: 3 purchases or units

  // Filter out offers with valid prices
  const validOffers = offers
    .filter((o) => typeof o.price === "number" && o.price > 0)
    .map((o) => ({
      shopName: o.shopName,
      price: o.price as number,
      formattedPrice: o.formattedPrice,
    }));

  if (validOffers.length <= 1) {
    return null; // Need at least 2 offers to calculate potential savings
  }

  // Find lowest price
  const bestPrice = validOffers.reduce((min, o) => (o.price < min ? o.price : min), Infinity);
  const bestStore = validOffers.find((o) => o.price === bestPrice)?.shopName || "Mejor tienda";

  // Calculate average price of the OTHER stores (excluding the best price store, or overall average)
  // Let's compute overall average of all other stores to see what we save compared to not finding the deal
  const otherOffers = validOffers.filter((o) => o.price > bestPrice);
  const comparisonBasePrice = otherOffers.length > 0
    ? otherOffers.reduce((sum, o) => sum + o.price, 0) / otherOffers.length
    : validOffers.reduce((sum, o) => sum + o.price, 0) / validOffers.length;

  // Single unit savings
  const singleSaving = Math.max(0, comparisonBasePrice - bestPrice);
  const savingPercentage = comparisonBasePrice > 0 ? (singleSaving / comparisonBasePrice) * 100 : 0;

  // Cumulative savings
  const cumulativeSaving = singleSaving * purchaseQuantity;
  const totalCostAtBestPrice = bestPrice * purchaseQuantity;
  const totalCostAtAveragePrice = comparisonBasePrice * purchaseQuantity;

  // Helper to format currency
  const formatArs = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // SVG dimensions for a clean responsive bar chart
  const chartHeight = 120;
  const chartWidth = 400;
  const barPadding = 45;
  const maxVal = Math.max(totalCostAtAveragePrice, totalCostAtBestPrice);
  const scaleMultiplier = maxVal > 0 ? (chartWidth - 100) / maxVal : 0;

  const widthBest = totalCostAtBestPrice * scaleMultiplier;
  const widthAvg = totalCostAtAveragePrice * scaleMultiplier;

  return (
    <div className="w-full bg-[#080a18] border-2 border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden" id="potential-savings-container">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950/50 pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/5">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Rendimiento de Compra Inteligente
            </span>
            <h3 className="font-display font-black text-white text-base sm:text-lg tracking-tight mt-0.5">
              Cálculo de Ahorro Acumulado
            </h3>
          </div>
        </div>
        <div className="text-[10px] font-sans font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1">
          <Percent className="w-3.5 h-3.5" />
          <span>¡Ahorrás {savingPercentage.toFixed(0)}% del valor promedio!</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left column: Controls & values */}
        <div className="lg:col-span-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Comprar en <strong className="text-white">{bestStore}</strong> en lugar de pagar el precio promedio de mercado te genera un beneficio directo. Ajustá la cantidad estimada de compras para proyectar tu ahorro acumulado:
          </p>

          {/* Interactive Multiplier slider */}
          <div className="bg-[#04060c] p-4 rounded-2xl border border-indigo-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cantidad de Compras / Unidades</span>
              </label>
              <span className="text-sm font-sans font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg">
                {purchaseQuantity} {purchaseQuantity === 1 ? "unidad" : "unidades"}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="20"
              value={purchaseQuantity}
              onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
              className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            
            <div className="flex justify-between text-[8px] text-slate-500 font-sans font-extrabold uppercase">
              <span>1 Unidad (Mín)</span>
              <span>10 Unidades</span>
              <span>20 Unidades (Máx)</span>
            </div>
          </div>

          {/* Savings breakdown table */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-slate-950/40 p-2.5 rounded-xl border border-indigo-950/50">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Precio Unitario
              </span>
              <span className="text-xs font-sans font-black text-slate-400 block line-through">
                {formatArs(comparisonBasePrice)}
              </span>
              <span className="text-[8px] text-slate-500 font-medium">Promedio</span>
            </div>

            <div className="bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/15">
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-1">
                Mejor Precio
              </span>
              <span className="text-xs font-sans font-black text-white block">
                {formatArs(bestPrice)}
              </span>
              <span className="text-[8px] text-emerald-500/80 font-bold truncate block px-0.5">{bestStore}</span>
            </div>

            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/25">
              <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest block mb-1">
                Ahorro Unitario
              </span>
              <span className="text-xs font-sans font-black text-emerald-400 block">
                {formatArs(singleSaving)}
              </span>
              <span className="text-[8px] text-emerald-300 font-medium">Por unidad</span>
            </div>
          </div>
        </div>

        {/* Right column: The Visual Chart Card */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="bg-[#04060c] border-2 border-indigo-950 rounded-2xl p-4.5 space-y-4 flex flex-col justify-between h-full">
            
            {/* Chart Title */}
            <div className="flex items-center justify-between border-b border-indigo-950/80 pb-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Comparativa de Gasto Acumulado ({purchaseQuantity} u.)
              </span>
              <span className="text-[10px] font-black text-emerald-400 font-sans flex items-center gap-1 animate-pulse">
                <TrendingDown className="w-3.5 h-3.5" />
                Ahorrás {formatArs(cumulativeSaving)}
              </span>
            </div>

            {/* Pure SVG Custom Responsive horizontal Bar Chart */}
            <div className="py-2 flex flex-col space-y-4">
              
              {/* Bar 1: Cost at Average Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-sans font-bold">
                  <span className="text-slate-400">Si pagás el precio promedio del mercado</span>
                  <span className="text-slate-300 font-black">{formatArs(totalCostAtAveragePrice)}</span>
                </div>
                <div className="w-full bg-slate-950 h-5 rounded-lg overflow-hidden border border-indigo-950/60 relative">
                  <div 
                    className="bg-slate-700 h-full rounded-l-md transition-all duration-500 ease-out"
                    style={{ width: `${(totalCostAtAveragePrice / maxVal) * 100}%` }}
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/60 uppercase tracking-widest">
                    Mercado Promedio
                  </span>
                </div>
              </div>

              {/* Bar 2: Cost at Best Price with highlighted saving block */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-sans font-bold">
                  <span className="text-emerald-400">Si comprás con Buscador de Precios AR</span>
                  <span className="text-emerald-400 font-black">{formatArs(totalCostAtBestPrice)}</span>
                </div>
                <div className="w-full bg-slate-950 h-5 rounded-lg overflow-hidden border border-indigo-950/60 relative flex">
                  {/* The actual cost portion */}
                  <div 
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full rounded-l-md transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    style={{ width: `${(totalCostAtBestPrice / maxVal) * 100}%` }}
                  />
                  {/* The saved portion representation */}
                  <div 
                    className="bg-emerald-500/15 border-l-2 border-dashed border-emerald-400/40 h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${((totalCostAtAveragePrice - totalCostAtBestPrice) / maxVal) * 100}%` }}
                  >
                    <span className="text-[8px] font-sans font-extrabold text-emerald-400/80 animate-pulse">
                      -{savingPercentage.toFixed(0)}% Ahorro
                    </span>
                  </div>
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-white uppercase tracking-widest">
                    {bestStore} (Mejor Opción)
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom summary text badge */}
            <div className="bg-[#080a18] border border-indigo-950/80 rounded-xl p-3 text-[11px] font-sans font-medium text-indigo-200 leading-relaxed flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Por cada compra de <strong className="text-white">{purchaseQuantity} u.</strong>, te quedan <strong className="text-emerald-400">{formatArs(cumulativeSaving)} libres</strong> en tu bolsillo para otros gastos de supermercado.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
