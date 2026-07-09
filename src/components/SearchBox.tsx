import React, { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const suggestions = [
    "Yerba Mate Playadito 1kg",
    "Smart TV 50 Smart",
    "Protector Solar Dermaglós",
    "Zapatillas Running",
    "Celular Motorola Edge",
  ];

  return (
    <div className="w-full bg-gradient-to-b from-[#161B30] to-[#0D1121] rounded-3xl border-2 border-indigo-500/30 shadow-2xl p-6 sm:p-8 max-w-2xl mx-auto transition-all duration-300 hover:border-pink-500/50 hover:shadow-[0_0_35px_rgba(236,72,153,0.15)]">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Rastreo en vivo con IA Grounding ⚡
        </div>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-pink-200 bg-clip-text">
          ¿Qué producto buscás hoy?
        </h2>
        <p className="text-indigo-200/80 text-sm mt-2 font-sans font-medium">
          Rastreamos ofertas reales en Argentina, comparamos cuotas contra inflación y aplicamos tus billeteras virtuales favoritas en segundos.
        </p>
        
        {/* Highlighted stores row with direct links */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-indigo-300 font-extrabold uppercase tracking-widest text-[10px]">Precios en:</span>
          
          <a 
            href="https://www.cotodigital3.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/35 hover:bg-yellow-500/20 hover:border-yellow-500/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            COTO
          </a>
          
          <a 
            href="https://www.carrefour.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/35 hover:bg-blue-500/20 hover:border-blue-500/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            CARREFOUR
          </a>
          
          <a 
            href="https://diaonline.supermercadosdia.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/35 hover:bg-red-500/20 hover:border-red-500/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            DÍA
          </a>
          
          <a 
            href="https://www.jumbo.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            JUMBO
          </a>
          
          <a 
            href="https://www.veasupermercados.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/35 hover:bg-amber-500/20 hover:border-amber-500/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            VEA
          </a>

          <a 
            href="https://www.masonline.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-sky-400/10 text-sky-300 border border-sky-400/35 hover:bg-sky-400/20 hover:border-sky-400/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(56,189,248,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            CHANGOMAS
          </a>

          <a 
            href="https://www.farmacity.com.ar" 
            target="_blank"  
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/35 hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            FARMACITY
          </a>
          
          <a 
            href="https://www.easy.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/35 hover:bg-orange-500/20 hover:border-orange-500/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(249,115,22,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            EASY
          </a>
          
          <a 
            href="https://www.pedidosya.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-[#E2001A]/10 text-pink-400 border border-[#E2001A]/35 hover:bg-[#E2001A]/20 hover:border-[#E2001A]/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(226,0,26,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            PEDIDOSYA
          </a>
          
          <a 
            href="https://www.rappi.com.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-[#FF441F]/10 text-[#FF441F] border border-[#FF441F]/35 hover:bg-[#FF441F]/20 hover:border-[#FF441F]/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(255,68,31,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            RAPPI
          </a>
          
          <a 
            href="https://listado.mercadolibre.com.ar/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/35 hover:bg-pink-500/20 hover:border-pink-500/60 transition-all font-display font-black tracking-wider shadow-[0_0_10px_rgba(236,72,153,0.15)] text-[11px] hover:scale-105 active:scale-95 cursor-pointer"
          >
            MERCADO LIBRE
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5.5 h-5.5 text-pink-400" />
          <input
            type="text"
            id="product-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. PlayStation 5, Azúcar Ledesma, Termo Stanley..."
            className="w-full pl-12 pr-4 py-4.5 bg-[#080B14] border-2 border-indigo-950 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:bg-[#080B14] font-sans text-base transition-all font-semibold"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          id="search-submit-btn"
          disabled={isLoading || !query.trim()}
          className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white font-display font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-purple-500/25 active:scale-[0.97] cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5 stroke-[3px]" />
              <span>Rastrear Precios</span>
            </>
          )}
        </button>
      </form>

      {/* Suggestion Chips */}
      <div className="mt-6">
        <p className="text-xs font-bold text-indigo-300/80 uppercase tracking-widest mb-3.5 text-center sm:text-left">
          🔥 Buscado frecuentemente hoy:
        </p>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion);
              }}
              disabled={isLoading}
              className="text-xs bg-[#121626] border border-indigo-500/20 hover:border-pink-500/60 hover:bg-pink-950/20 text-indigo-100 hover:text-pink-300 px-3.5 py-2 rounded-xl transition-all font-sans font-bold cursor-pointer disabled:opacity-50 hover:shadow-[0_0_12px_rgba(236,72,153,0.15)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
