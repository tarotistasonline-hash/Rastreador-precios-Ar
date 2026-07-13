import { useState } from "react";
import { ExternalLink, Percent, HelpCircle, Store, Award, Pencil, Check, X } from "lucide-react";
import { Offer } from "../types";
import { motion } from "motion/react";
import { trackEvent } from "../utils/mixpanel";

interface OfferCardProps {
  offer: Offer;
  onUpdatePrice?: (shopName: string, newPrice: number) => void;
  isSelected?: boolean;
  onToggleCompare?: () => void;
  showCompareOption?: boolean;
  isHighlighted?: boolean;
  highlightLabel?: string;
}

export default function OfferCard({ 
  offer, 
  onUpdatePrice,
  isSelected = false,
  onToggleCompare,
  showCompareOption = true,
  isHighlighted = false,
  highlightLabel,
}: OfferCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  // Determine dynamic visual styles based on store name
  const getStoreStyle = (store: string) => {
    const name = store.toLowerCase();
    if (name.includes("mercado libre") || name.includes("mercadolibre")) {
      return {
        bg: "bg-[#1E190B] hover:bg-[#2B230E]",
        border: "border-amber-500/70 hover:border-amber-400",
        badge: "bg-amber-400 text-slate-950",
        brandColor: "text-amber-400",
        glow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]",
        logoColor: "amber"
      };
    }
    if (name.includes("coto")) {
      return {
        bg: "bg-[#25090E] hover:bg-[#340C12]",
        border: "border-red-500/70 hover:border-red-400",
        badge: "bg-red-500 text-white",
        brandColor: "text-red-400",
        glow: "hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]",
        logoColor: "red"
      };
    }
    if (name.includes("carrefour")) {
      return {
        bg: "bg-[#0A142D] hover:bg-[#0E1E41]",
        border: "border-blue-500/70 hover:border-blue-400",
        badge: "bg-blue-600 text-white",
        brandColor: "text-blue-400",
        glow: "hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]",
        logoColor: "blue"
      };
    }
    if (name.includes("jumbo")) {
      return {
        bg: "bg-[#062010] hover:bg-[#0A3018]",
        border: "border-emerald-500/70 hover:border-emerald-400",
        badge: "bg-emerald-500 text-white",
        brandColor: "text-emerald-400",
        glow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
        logoColor: "emerald"
      };
    }
    if (name.includes("dia") || name.includes("día")) {
      return {
        bg: "bg-[#27091A] hover:bg-[#380C25]",
        border: "border-pink-500/70 hover:border-pink-400",
        badge: "bg-pink-500 text-white",
        brandColor: "text-pink-400",
        glow: "hover:shadow-[0_0_25px_rgba(236,72,153,0.25)]",
        logoColor: "pink"
      };
    }
    if (name.includes("vea")) {
      return {
        bg: "bg-[#281308] hover:bg-[#381B0B]",
        border: "border-orange-500/70 hover:border-orange-400",
        badge: "bg-orange-500 text-white",
        brandColor: "text-orange-400",
        glow: "hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]",
        logoColor: "orange"
      };
    }
    if (name.includes("bna") || name.includes("nación") || name.includes("nacion")) {
      return {
        bg: "bg-[#081C2B] hover:bg-[#0C2B42]",
        border: "border-cyan-500/70 hover:border-cyan-400",
        badge: "bg-cyan-500 text-slate-950 font-bold",
        brandColor: "text-cyan-400",
        glow: "hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]",
        logoColor: "cyan"
      };
    }
    if (name.includes("provincia")) {
      return {
        bg: "bg-[#062019] hover:bg-[#0A3026]",
        border: "border-teal-500/70 hover:border-teal-400",
        badge: "bg-teal-500 text-slate-950 font-bold",
        brandColor: "text-teal-400",
        glow: "hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]",
        logoColor: "teal"
      };
    }
    if (name.includes("pedidosya") || name.includes("pedidos ya")) {
      return {
        bg: "bg-[#290810] hover:bg-[#3B0C17]",
        border: "border-rose-500/70 hover:border-rose-400",
        badge: "bg-rose-500 text-white",
        brandColor: "text-rose-400",
        glow: "hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]",
        logoColor: "rose"
      };
    }
    if (name.includes("rappi")) {
      return {
        bg: "bg-[#281008] hover:bg-[#38170B]",
        border: "border-orange-500/70 hover:border-orange-400",
        badge: "bg-orange-500 text-white",
        brandColor: "text-orange-400",
        glow: "hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]",
        logoColor: "orange"
      };
    }
    if (name.includes("easy")) {
      return {
        bg: "bg-[#201B09] hover:bg-[#30280D]",
        border: "border-yellow-500/70 hover:border-yellow-400",
        badge: "bg-yellow-400 text-slate-950 font-bold",
        brandColor: "text-yellow-400",
        glow: "hover:shadow-[0_0_25px_rgba(234,179,8,0.25)]",
        logoColor: "yellow"
      };
    }
    // Default fallback
    return {
      bg: "bg-[#111625] hover:bg-[#1A2035]",
      border: "border-slate-800 hover:border-slate-700",
      badge: "bg-indigo-600 text-white",
      brandColor: "text-slate-300",
      glow: "hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]",
      logoColor: "indigo"
    };
  };

  const style = getStoreStyle(offer.shopName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      id={`offer-${offer.shopName.replace(/\s+/g, '-').toLowerCase()}`}
      className={`relative h-full flex flex-col rounded-3xl border-2 ${
        isHighlighted
          ? "border-emerald-400 ring-4 ring-emerald-400/25 shadow-[0_0_35px_rgba(16,185,129,0.35)]"
          : offer.isBestDeal
            ? "border-pink-500 ring-2 ring-pink-500/25 shadow-2xl shadow-pink-500/20"
            : `${style.border} ${style.glow}`
      } ${style.bg} p-6 transition-all duration-300`}
    >
      {/* Best Deal Banner */}
      {offer.isBestDeal && (
        <div className="absolute -top-3.5 left-4 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg shadow-pink-500/30 flex items-center gap-1.5 border border-pink-400 animate-bounce">
          <Award className="w-3.5 h-3.5 fill-white/25" />
          <span>★ RECOMENDADO IA</span>
        </div>
      )}

      {/* Bank Highlight Banner */}
      {isHighlighted && (
        <div className="absolute -top-3.5 right-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-[10px] font-sans font-black px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-300/50 flex items-center gap-1 z-10 animate-pulse">
          <span>{highlightLabel || "✨ REINTEGRO DISPONIBLE"}</span>
        </div>
      )}

      {/* Store & Price header */}
      <div className="flex justify-between items-start gap-3 mb-4 mt-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#060810] border-2 border-indigo-950 rounded-xl shadow-inner">
              <Store className={`w-5 h-5 ${style.brandColor}`} />
            </div>
            <span className="font-display font-black text-lg text-white tracking-tight">
              {offer.shopName}
            </span>
          </div>
          {showCompareOption && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare?.();
              }}
              className={`px-3 py-1 rounded-xl border font-display font-black text-[9px] tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer select-none self-start ${
                isSelected
                  ? "bg-pink-500 text-white border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.3)] hover:bg-pink-600"
                  : "bg-[#060810] hover:bg-[#121626] border-indigo-950 text-slate-400 hover:text-white"
              }`}
            >
              {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3px]" /> : null}
              <span>{isSelected ? "Comparando" : "+ Comparar"}</span>
            </button>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleanVal = editValue.replace(/[^0-9]/g, "");
                const num = Number(cleanVal);
                if (num > 0 && onUpdatePrice) {
                  onUpdatePrice(offer.shopName, num);
                }
                setIsEditing(false);
              }}
              className="flex items-center gap-1 bg-[#060810] border border-indigo-500/30 rounded-xl p-1 shrink-0"
            >
              <span className="text-xs text-slate-400 font-bold ml-1">$</span>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Ej. 22499"
                className="w-24 bg-transparent text-right font-display font-black text-sm text-white focus:outline-hidden px-1"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 hover:text-emerald-400 text-slate-400 transition-colors cursor-pointer"
                title="Guardar"
              >
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <div className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text">
                  {offer.formattedPrice}
                </div>
                {onUpdatePrice && (
                  <button
                    onClick={() => {
                      setEditValue(offer.price ? String(offer.price) : "");
                      setIsEditing(true);
                    }}
                    className="p-1 hover:text-pink-400 text-slate-500 transition-all hover:scale-110 cursor-pointer"
                    title="Corregir precio"
                  >
                    <Pencil className="w-3.5 h-3.5 stroke-[2.5px]" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {offer.isUserEdited && (
                  <span className="text-[9px] bg-pink-500/15 text-pink-300 border border-pink-500/35 px-1.5 py-0.5 rounded-full font-sans font-bold uppercase tracking-wider animate-pulse">
                    ✍️ Ajustado
                  </span>
                )}
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 font-sans">
                  Pesos ARS
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          {/* Discounts box */}
          {offer.discounts && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4.5 flex items-start gap-3 shadow-lg shadow-emerald-950/20">
              <Percent className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0 animate-pulse" />
              <div className="text-xs text-emerald-200 font-sans leading-relaxed">
                <span className="font-extrabold block mb-1 text-emerald-400 uppercase tracking-wider text-[10px]">
                  🎁 Beneficios Aplicables:
                </span>
                <span className="font-medium">{offer.discounts}</span>
              </div>
            </div>
          )}

          {/* Payment comparative analysis */}
          <div className="bg-[#05070e]/95 border-2 border-indigo-950 rounded-2xl p-4.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-300 uppercase tracking-wider mb-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Análisis de Pago (Inflación)</span>
            </div>
            <p className="text-xs text-slate-300 font-sans font-medium leading-relaxed">
              {offer.paymentComparison}
            </p>
          </div>
        </div>

        {/* CTA Purchase button */}
        <div className="pt-4 border-t border-indigo-950/60">
          <a
            href={offer.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            onClick={() => {
              trackEvent("offer_purchase_clicked", {
                shop_name: offer.shopName,
                price: offer.price,
                is_best_deal: !!offer.isBestDeal
              });
            }}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-display font-black text-sm transition-all shadow-md cursor-pointer ${
              offer.isBestDeal
                ? "bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white shadow-pink-500/10 hover:shadow-xl hover:scale-[1.02]"
                : "bg-slate-900 border border-indigo-500/20 hover:border-pink-500/50 hover:bg-[#121626] text-white hover:shadow-lg hover:scale-[1.01]"
            }`}
          >
            <span>Ir a comprar</span>
            <ExternalLink className="w-4 h-4 stroke-[2.5px]" />
          </a>
          <span className="block text-[10px] text-center text-slate-500 mt-2 font-sans font-medium">
            Abre sitio oficial de la tienda
          </span>
        </div>
      </div>
    </motion.div>
  );
}
