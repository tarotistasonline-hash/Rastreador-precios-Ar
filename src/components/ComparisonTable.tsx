import React from "react";
import { Offer } from "../types";
import { 
  Scale, 
  Trash2, 
  X, 
  ExternalLink, 
  Percent, 
  HelpCircle, 
  Sparkles, 
  Award, 
  TrendingDown, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Wallet,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ComparisonTableProps {
  selectedOffers: Offer[];
  productName: string;
  onRemoveOffer: (shopName: string) => void;
  onClearComparison: () => void;
}

interface WalletPromo {
  name: string;
  badgeColor: string;
  percentage: number;
  cap: number;
  description: string;
  applicableStores?: string[]; // stores in lowercase
}

const argPromos: WalletPromo[] = [
  {
    name: "Cuenta DNI",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    percentage: 30,
    cap: 8000,
    description: "Banco Provincia - Especial Supermercados",
    applicableStores: ["coto", "carrefour", "jumbo", "dia", "día", "vea", "changomas", "masonline"]
  },
  {
    name: "MODO",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    percentage: 20,
    cap: 4000,
    description: "Bancos Asociados (Galicia, Santander, BBVA, etc.)"
  },
  {
    name: "BNA+ (Banco Nación)",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    percentage: 30,
    cap: 10000,
    description: "Especial Miércoles de Supermercados"
  },
  {
    name: "Naranja X",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    percentage: 15,
    cap: 5000,
    description: "Plan Zeta o Descuento Directo"
  },
  {
    name: "Personal Pay",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    percentage: 20,
    cap: 3000,
    description: "Reintegro según Nivel de consumos"
  }
];

export default function ComparisonTable({
  selectedOffers,
  productName,
  onRemoveOffer,
  onClearComparison,
}: ComparisonTableProps) {
  
  if (selectedOffers.length === 0) {
    return null;
  }

  // Find the lowest price among compared offers to highlight it
  const lowestPrice = selectedOffers.reduce((min, o) => {
    if (o.price && o.price < min) return o.price;
    return min;
  }, Infinity);

  // Helper to get AI Recommended Option (Best Store + Best Payment/Wallet Promo combination)
  const getAiRecommendation = () => {
    if (selectedOffers.length < 2) return null;

    let bestOpt: {
      shopName: string;
      paymentMethod: string;
      originalPrice: number;
      finalPrice: number;
      discount: number;
      promoBadgeColor?: string;
      badgeDescription?: string;
    } | null = null;

    let minPrice = Infinity;

    selectedOffers.forEach(offer => {
      if (!offer.price) return;

      // Check cash base price option
      if (offer.price < minPrice) {
        minPrice = offer.price;
        bestOpt = {
          shopName: offer.shopName,
          paymentMethod: "Efectivo / Débito",
          originalPrice: offer.price,
          finalPrice: offer.price,
          discount: 0,
          badgeDescription: "Mejor precio directo disponible al contado"
        };
      }

      // Check all available wallet promos
      const promos = calculatePromos(offer.price, offer.shopName);
      promos.forEach(promo => {
        if (promo.finalPrice < minPrice) {
          minPrice = promo.finalPrice;
          bestOpt = {
            shopName: offer.shopName,
            paymentMethod: promo.name,
            originalPrice: offer.price || 0,
            finalPrice: promo.finalPrice,
            discount: promo.discount,
            promoBadgeColor: promo.badgeColor,
            badgeDescription: `${promo.description} (-${promo.percentage}%)`
          };
        }
      });
    });

    return bestOpt;
  };

  const aiRecommendation = getAiRecommendation();

  // Helper to format currency
  const formatArs = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handler to download comparison table as CSV
  const handleDownloadCsv = () => {
    if (selectedOffers.length === 0) return;

    // CSV Headers
    const headers = [
      "Producto",
      "Tienda",
      "Precio Original",
      "Financiacion y Pagos",
      "Descuentos",
      "Mejor Oferta",
      "Precio Cuenta DNI",
      "Precio MODO",
      "Precio BNA+",
      "Precio Naranja X",
      "Precio Personal Pay",
      "Enlace de Compra"
    ];

    const rows = selectedOffers.map(offer => {
      // Calculate promos
      const promos = calculatePromos(offer.price, offer.shopName);
      const findPromoPrice = (name: string) => {
        const p = promos.find(pr => pr.name === name);
        return p ? p.finalPrice : (offer.price || 0);
      };

      const cuentaDniPrice = findPromoPrice("Cuenta DNI");
      const modoPrice = findPromoPrice("MODO");
      const bnaPrice = findPromoPrice("BNA+ (Banco Nación)");
      const naranjaPrice = findPromoPrice("Naranja X");
      const personalPayPrice = findPromoPrice("Personal Pay");

      return [
        productName,
        offer.shopName,
        offer.price ? offer.price.toString() : "",
        offer.paymentComparison,
        offer.discounts || "",
        offer.isBestDeal ? "SI" : "NO",
        cuentaDniPrice ? cuentaDniPrice.toString() : "",
        modoPrice ? modoPrice.toString() : "",
        bnaPrice ? bnaPrice.toString() : "",
        naranjaPrice ? naranjaPrice.toString() : "",
        personalPayPrice ? personalPayPrice.toString() : "",
        offer.purchaseUrl
      ];
    });

    // Construct CSV string, escape double quotes and wrap values in quotes
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create a Blob and download it
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `comparativa_precios_${productName.toLowerCase().replace(/[^a-z0-9]/gi, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to calculate promotions
  const calculatePromos = (price: number | undefined, store: string) => {
    if (!price) return [];
    
    const storeLower = store.toLowerCase();
    
    return argPromos
      .filter(promo => {
        if (!promo.applicableStores) return true;
        return promo.applicableStores.some(s => storeLower.includes(s));
      })
      .map(promo => {
        const rawDiscount = price * (promo.percentage / 100);
        const discount = Math.min(rawDiscount, promo.cap);
        const finalPrice = price - discount;
        const isCapped = rawDiscount > promo.cap;
        
        return {
          ...promo,
          discount,
          finalPrice,
          isCapped
        };
      });
  };

  // Helper to determine store style
  const getStoreStyle = (store: string) => {
    const name = store.toLowerCase();
    if (name.includes("mercado libre") || name.includes("mercadolibre")) {
      return {
        border: "border-amber-500/40 focus:border-amber-400",
        badge: "bg-amber-400 text-slate-950",
        text: "text-amber-400",
        bg: "from-[#1a1409] to-[#090704]",
      };
    }
    if (name.includes("coto")) {
      return {
        border: "border-red-500/40 focus:border-red-400",
        badge: "bg-red-500 text-white",
        text: "text-red-400",
        bg: "from-[#20070a] to-[#090203]",
      };
    }
    if (name.includes("carrefour")) {
      return {
        border: "border-blue-500/40 focus:border-blue-400",
        badge: "bg-blue-600 text-white",
        text: "text-blue-400",
        bg: "from-[#081126] to-[#03060f]",
      };
    }
    if (name.includes("jumbo")) {
      return {
        border: "border-emerald-500/40 focus:border-emerald-400",
        badge: "bg-emerald-500 text-white",
        text: "text-emerald-400",
        bg: "from-[#051a0d] to-[#020904]",
      };
    }
    if (name.includes("dia") || name.includes("día")) {
      return {
        border: "border-pink-500/40 focus:border-pink-400",
        badge: "bg-pink-500 text-white",
        text: "text-pink-400",
        bg: "from-[#200715] to-[#090206]",
      };
    }
    if (name.includes("vea")) {
      return {
        border: "border-orange-500/40 focus:border-orange-400",
        badge: "bg-orange-500 text-white",
        text: "text-orange-400",
        bg: "from-[#200f06] to-[#090401]",
      };
    }
    if (name.includes("farmacity")) {
      return {
        border: "border-cyan-500/40 focus:border-cyan-400",
        badge: "bg-cyan-500 text-slate-950 font-bold",
        text: "text-cyan-400",
        bg: "from-[#051a1e] to-[#02090a]",
      };
    }
    if (name.includes("changomas") || name.includes("masonline")) {
      return {
        border: "border-sky-500/40 focus:border-sky-400",
        badge: "bg-sky-500 text-slate-950 font-bold",
        text: "text-sky-400",
        bg: "from-[#051722] to-[#02080c]",
      };
    }
    return {
      border: "border-indigo-500/30 focus:border-indigo-400",
      badge: "bg-indigo-600 text-white",
      text: "text-slate-300",
      bg: "from-[#0e1222] to-[#060811]",
    };
  };

  return (
    <div className="w-full bg-[#0a0d1d] border-2 border-pink-500/25 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden" id="comparison-table-wrapper">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950/60 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/35 rounded-2xl text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)] shrink-0">
            <Scale className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-pink-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400" /> Comparativa Lado a Lado
            </span>
            <h3 className="font-display font-black text-white text-base sm:text-lg tracking-tight mt-0.5">
              Comparando ofertas para: <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">"{productName}"</span>
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg hover:shadow-emerald-500/10 active:scale-98"
            title="Descargar tabla comparativa actual en formato CSV para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>

          <button
            onClick={onClearComparison}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#131a30] text-slate-400 hover:text-white border border-indigo-950 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer active:scale-98"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar Selección</span>
          </button>
        </div>
      </div>

      {/* Grid of Columns for Side-by-Side comparison */}
      <div className="relative z-10">
        {/* AI Recommended Option Banner */}
        {aiRecommendation && (
          <div className="mb-6 p-4.5 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-pink-500/30 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-pink-500/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-pink-500 text-slate-950 font-black rounded-xl shrink-0 shadow-lg shadow-pink-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1">
                  Recomendación Estratégica Inteligente
                </span>
                <h4 className="font-display font-black text-white text-sm sm:text-base tracking-tight leading-snug">
                  Combinación Óptima: <span className="text-pink-400">{aiRecommendation.shopName}</span> + <span className="text-cyan-400">{aiRecommendation.paymentMethod}</span>
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Para maximizar tu ahorro en esta comparativa, te sugerimos comprar en <strong className="text-white">{aiRecommendation.shopName}</strong> pagando con <strong className="text-white">{aiRecommendation.paymentMethod}</strong>. Esto reduce el precio original de <strong className="text-slate-400 line-through">{formatArs(aiRecommendation.originalPrice)}</strong> a solo <strong className="text-emerald-400 font-bold">{formatArs(aiRecommendation.finalPrice)}</strong>, ahorrando un total de <strong className="text-emerald-400">{formatArs(aiRecommendation.discount)}</strong> ({aiRecommendation.badgeDescription}).
                </p>
              </div>
            </div>
            <div className="bg-slate-950/60 border border-pink-500/20 rounded-xl px-4 py-3 shrink-0 text-right w-full md:w-auto flex md:flex-col justify-between items-center md:items-end gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Precio Final Estimado</span>
              <span className="text-lg font-display font-black text-emerald-400 block">{formatArs(aiRecommendation.finalPrice)}</span>
              {aiRecommendation.discount > 0 && (
                <span className="text-[10px] font-sans font-bold text-pink-400 block">Ahorro: -{formatArs(aiRecommendation.discount)}</span>
              )}
            </div>
          </div>
        )}

        {selectedOffers.length < 2 && (
          <div className="p-6 bg-slate-950/40 border border-indigo-950 rounded-2xl text-center max-w-md mx-auto my-4 text-slate-400 text-xs font-medium">
            💡 Seleccioná al menos <strong className="text-white">2 productos</strong> de las ofertas de abajo para ver la comparativa lado a lado con promociones y financiación.
          </div>
        )}

        <div className={`grid grid-cols-1 ${selectedOffers.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"} gap-6`}>
          <AnimatePresence mode="popLayout">
            {selectedOffers.map((offer, idx) => {
              const styles = getStoreStyle(offer.shopName);
              const isCheapest = offer.price === lowestPrice && selectedOffers.length > 1;
              const isAiRecommended = aiRecommendation && offer.shopName === aiRecommendation.shopName;

              return (
                <motion.div
                  key={offer.shopName}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`relative flex flex-col justify-between rounded-3xl border-2 p-5.5 bg-gradient-to-b ${styles.bg} ${
                    isAiRecommended
                      ? "border-pink-500 ring-2 ring-pink-500/10 shadow-[0_15px_30px_rgba(236,72,153,0.15)] scale-[1.01]"
                      : isCheapest 
                        ? "border-emerald-500 ring-2 ring-emerald-500/10 shadow-[0_15px_30px_rgba(16,185,129,0.15)]"
                        : "border-indigo-950/80 shadow-lg"
                  }`}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveOffer(offer.shopName)}
                    className="absolute top-4.5 right-4.5 p-1.5 bg-[#060810]/80 hover:bg-rose-950/40 border border-indigo-950 hover:border-rose-500/30 rounded-xl text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    title="Quitar de la comparativa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    {/* Store Title & Badges */}
                    <div className="flex flex-wrap items-center gap-2 pr-6 mb-4">
                      <span className="font-display font-black text-white text-base tracking-tight uppercase">
                        {offer.shopName}
                      </span>
                      {isAiRecommended && (
                        <span className="bg-pink-500 text-slate-950 font-display font-black text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md shadow-pink-500/20">
                          <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950 animate-pulse" /> Recomendado por IA
                        </span>
                      )}
                      {isCheapest && !isAiRecommended && (
                        <span className="bg-emerald-500 text-slate-950 font-display font-black text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow-md shadow-emerald-500/15">
                          ✓ El más barato
                        </span>
                      )}
                      {offer.isBestDeal && !isAiRecommended && !isCheapest && (
                        <span className="bg-pink-500 text-white font-display font-black text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5" /> IA
                        </span>
                      )}
                    </div>

                    {/* Price Row */}
                    <div className="bg-[#05070e]/90 border border-indigo-950/80 rounded-2xl p-4 mb-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">
                          Precio Efectivo/Contado
                        </span>
                        <span className={`font-display font-black text-2xl sm:text-3xl tracking-tight ${isCheapest || isAiRecommended ? "text-emerald-400" : "text-white"}`}>
                          {offer.formattedPrice}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-sans font-bold text-slate-500 block">MONEDA</span>
                        <span className="text-xs font-bold text-slate-400 font-mono">ARS</span>
                      </div>
                    </div>

                    {/* Bank promotions section */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                        <Percent className="w-3.5 h-3.5 text-pink-400" />
                        <span>Descuentos y Promos Bancarias</span>
                      </div>
                      {offer.discounts ? (
                        <div className="bg-slate-950/50 rounded-2xl border border-indigo-950/40 p-4 text-xs font-sans font-medium text-indigo-100 leading-relaxed min-h-[90px]">
                          {offer.discounts}
                        </div>
                      ) : (
                        <div className="bg-slate-950/30 rounded-2xl border border-indigo-950/10 p-4 text-xs font-sans font-medium text-slate-500 italic flex items-center justify-center min-h-[90px]">
                          No se informan descuentos específicos hoy
                        </div>
                      )}
                    </div>

                    {/* Installments & Inflation comparative section */}
                    <div className="mb-5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                        <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Análisis de Financiación</span>
                      </div>
                      <div className="bg-[#05070e]/95 rounded-2xl border-2 border-indigo-950/60 p-4 text-xs font-sans font-medium text-slate-300 leading-relaxed min-h-[95px]">
                        {offer.paymentComparison}
                      </div>
                    </div>

                    {/* Billeteras y Tarjetas Savings section */}
                    <div className="mb-5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                        <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ahorro con Billeteras / Tarjetas</span>
                      </div>
                      <div className="space-y-2">
                        {calculatePromos(offer.price, offer.shopName).length > 0 ? (
                          calculatePromos(offer.price, offer.shopName).map((promo) => (
                            <div 
                              key={promo.name} 
                              className="bg-[#05070e]/60 border border-indigo-950/50 rounded-2xl p-3 flex items-center justify-between text-xs hover:border-indigo-500/20 transition-all group"
                            >
                              <div className="space-y-1 pr-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase border ${promo.badgeColor}`}>
                                    {promo.name}
                                  </span>
                                  <span className="text-[10px] font-black text-white">-{promo.percentage}%</span>
                                </div>
                                <span className="text-[10px] text-slate-400 leading-tight block font-medium group-hover:text-slate-300">
                                  {promo.description}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-emerald-400 block">
                                  {formatArs(promo.finalPrice)}
                                </span>
                                <span className="text-[9px] font-sans font-bold text-slate-500 block">
                                  Ahorrás: <strong className="text-emerald-500/80">{formatArs(promo.discount)}</strong>
                                  {promo.isCapped && " (Tope)"}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-[#05070e]/30 rounded-2xl border border-indigo-950/20 p-4 text-xs text-slate-500 text-center italic">
                            Sin descuentos adicionales de billeteras hoy
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buy/CTA link */}
                  <div className="border-t border-indigo-950/40 pt-4 mt-2">
                    <a
                      href={offer.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isCheapest
                          ? "bg-emerald-600 hover:bg-emerald-500 text-slate-950 hover:scale-[1.02] shadow-md shadow-emerald-600/10"
                          : "bg-slate-900 border border-indigo-950 hover:border-pink-500/40 text-white hover:bg-[#111626]"
                      }`}
                    >
                      <span>Ir a tienda</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {selectedOffers.length > 0 && (
          <div className="mt-5 flex items-center gap-2 bg-pink-500/10 border border-pink-500/25 rounded-2xl p-4 text-xs text-pink-300 font-sans max-w-4xl mx-auto">
            <ShoppingBag className="w-4 h-4 shrink-0 text-pink-400 animate-pulse" />
            <span>
              <strong>Consejo de Rastreo Inteligente:</strong> El costo financiero real suele verse afectado por las cuotas con recargo. Considerá comprar en la tienda con <strong>promoción los martes/miércoles</strong> o la que posea cuotas sin interés si el precio de contado es similar.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
