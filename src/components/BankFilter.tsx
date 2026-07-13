import React from "react";
import { Filter, Sparkles, HelpCircle, Check, CreditCard } from "lucide-react";
import { trackEvent } from "../utils/mixpanel";
import { Offer } from "../types";

export interface Bank {
  id: string;
  name: string;
  keywords: string[];
  emoji: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  glowColor: string;
}

export const BANK_OPTIONS: Bank[] = [
  {
    id: "nacion",
    name: "Banco Nación",
    keywords: ["nación", "nacion", "bna"],
    emoji: "🏛️",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-300",
    borderColor: "border-cyan-500/60",
    glowColor: "shadow-cyan-500/20",
  },
  {
    id: "provincia",
    name: "Banco Provincia / Cuenta DNI",
    keywords: ["provincia", "cuenta dni", "dni", "provinciacompras"],
    emoji: "💚",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
    borderColor: "border-emerald-500/60",
    glowColor: "shadow-emerald-500/20",
  },
  {
    id: "galicia",
    name: "Banco Galicia",
    keywords: ["galicia"],
    emoji: "🍊",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
    borderColor: "border-amber-500/60",
    glowColor: "shadow-amber-500/20",
  },
  {
    id: "santander",
    name: "Banco Santander",
    keywords: ["santander"],
    emoji: "❤️",
    badgeBg: "bg-red-500/15",
    badgeText: "text-red-400",
    borderColor: "border-red-500/60",
    glowColor: "shadow-red-500/20",
  },
  {
    id: "macro",
    name: "Banco Macro",
    keywords: ["macro"],
    emoji: "🌀",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-400",
    borderColor: "border-blue-500/60",
    glowColor: "shadow-blue-500/20",
  },
  {
    id: "naranjax",
    name: "Tarjeta Naranja X",
    keywords: ["naranja", "naranja x", "naranjax", "plan zeta"],
    emoji: "💳",
    badgeBg: "bg-pink-500/15",
    badgeText: "text-pink-400",
    borderColor: "border-pink-500/60",
    glowColor: "shadow-pink-500/20",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    keywords: ["mercado pago", "mercadopago", "dinero en cuenta"],
    emoji: "📱",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-400",
    borderColor: "border-sky-500/60",
    glowColor: "shadow-sky-500/20",
  },
  {
    id: "bbva",
    name: "Banco BBVA",
    keywords: ["bbva", "francés", "frances"],
    emoji: "🔵",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-400",
    borderColor: "border-indigo-500/60",
    glowColor: "shadow-indigo-500/20",
  },
  {
    id: "icbc",
    name: "Banco ICBC",
    keywords: ["icbc"],
    emoji: "🚩",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-400",
    borderColor: "border-rose-500/60",
    glowColor: "shadow-rose-500/20",
  },
];

interface BankFilterProps {
  selectedBankId: string;
  onSelectBank: (bankId: string) => void;
  matchesCount?: number;
}

export default function BankFilter({
  selectedBankId,
  onSelectBank,
  matchesCount = 0,
}: BankFilterProps) {
  const currentBank = BANK_OPTIONS.find((b) => b.id === selectedBankId);

  const handleSelect = (bankId: string) => {
    onSelectBank(bankId);
    const selected = BANK_OPTIONS.find((b) => b.id === bankId);
    trackEvent("bank_filter_selected", {
      bank_id: bankId,
      bank_name: selected ? selected.name : "Ninguno",
    });
  };

  return (
    <div className="w-full bg-[#0B0F19]/90 backdrop-blur-md border border-slate-800/60 p-5 rounded-3xl shadow-2xl relative overflow-hidden" id="bank-filter-container">
      {/* Decorative neon light streak */}
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-600/40 to-indigo-500/20" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-display font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <CreditCard className="w-4 h-4 text-pink-400 animate-pulse" />
            💳 Destacar Reintegros de tu Banco
          </h3>
          <p className="text-xs text-indigo-200/70 font-sans font-medium">
            Seleccioná tu entidad financiera para resaltar de forma automática las ofertas que tienen beneficios con tu tarjeta hoy.
          </p>
        </div>

        {selectedBankId && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              Estado de Filtro:
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-bold text-emerald-400 animate-fadeIn">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                {matchesCount} {matchesCount === 1 ? "beneficio encontrado" : "beneficios encontrados"}
              </span>
            </div>
            <button
              onClick={() => handleSelect("")}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-all uppercase font-display font-black cursor-pointer"
            >
              Quitar
            </button>
          </div>
        )}
      </div>

      {/* Grid of popular banks (Quick Access chips) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-3.5">
        <button
          onClick={() => handleSelect("")}
          className={`px-3 py-2.5 rounded-2xl border text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
            selectedBankId === ""
              ? "bg-slate-100 border-white text-slate-950 shadow-md scale-102"
              : "bg-[#060810]/70 border-indigo-950 text-slate-300 hover:border-slate-700 hover:text-white"
          }`}
        >
          <span>🌐</span>
          <span>Todos</span>
        </button>

        {BANK_OPTIONS.map((bank) => {
          const isActive = selectedBankId === bank.id;
          return (
            <button
              key={bank.id}
              onClick={() => handleSelect(bank.id)}
              className={`px-3 py-2.5 rounded-2xl border text-xs font-sans font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-center ${
                isActive
                  ? `bg-[#131b2e] ${bank.borderColor} ${bank.badgeText} shadow-md shadow-purple-500/5 ring-1 ring-pink-500/20 scale-102`
                  : "bg-[#060810]/70 border-indigo-950/80 text-slate-400 hover:border-slate-800 hover:text-slate-200 hover:bg-[#090d19]/80"
              }`}
            >
              <span className="text-base">{bank.emoji}</span>
              <span className="truncate max-w-[85px] sm:max-w-none text-[11px] sm:text-xs">
                {bank.id === "nacion" ? "Nación BNA" : bank.id === "provincia" ? "Provincia" : bank.name.replace("Banco ", "")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Accessible Dropdown Selector */}
      <div className="flex items-center gap-2 bg-[#060810]/50 border border-indigo-950/40 p-2.5 rounded-xl text-xs md:hidden">
        <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="text-slate-400 font-semibold shrink-0">Buscador completo:</span>
        <select
          value={selectedBankId}
          onChange={(e) => handleSelect(e.target.value)}
          className="flex-1 bg-[#060810] border border-indigo-950 rounded-lg text-white font-semibold focus:outline-hidden focus:border-pink-500 px-2.5 py-1.5 cursor-pointer text-xs"
        >
          <option value="">-- Sin Filtro / Mostrar todos los bancos --</option>
          {BANK_OPTIONS.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.emoji} {bank.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function checkOfferMatchesBank(offer: Offer, bankId: string): boolean {
  if (!bankId) return false;
  const bank = BANK_OPTIONS.find((b) => b.id === bankId);
  if (!bank) return false;
  
  const discountsText = (offer.discounts || "").toLowerCase();
  const paymentText = (offer.paymentComparison || "").toLowerCase();
  const shopNameText = (offer.shopName || "").toLowerCase();
  const fullText = `${discountsText} ${paymentText} ${shopNameText}`;
  
  return bank.keywords.some((keyword) => fullText.includes(keyword.toLowerCase()));
}
