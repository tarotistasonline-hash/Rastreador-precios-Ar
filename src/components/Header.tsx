import { SearchCode, TrendingUp, Zap } from "lucide-react";

interface HeaderProps {
  extremeSavingsMode: boolean;
  onToggleExtremeSavings: (enabled: boolean) => void;
}

export default function Header({ extremeSavingsMode, onToggleExtremeSavings }: HeaderProps) {
  return (
    <header className="w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50 py-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 text-white p-2.5 rounded-2xl shadow-xl shadow-purple-500/25 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
            <SearchCode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl sm:text-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
              Rastreo de Precios AR
              <span className="flex items-center gap-1 text-[10px] bg-red-500/15 text-red-400 border border-red-500/35 px-2 py-0.5 rounded-full font-sans font-bold uppercase animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block shrink-0" />
                VIVO 🇦🇷
              </span>
            </h1>
            <p className="text-xs text-indigo-200/70 font-sans font-medium mt-0.5">
              Buscador inteligente con Inteligencia Artificial y Datos en Vivo
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Extreme Savings Mode Badge (Always ON) */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-display font-black uppercase tracking-wider border select-none bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.35)] animate-pulse"
            id="extreme-savings-toggle-btn"
            title="Ahorro Extremo está siempre activado por defecto para priorizar las mejores promociones"
          >
            <Zap className="w-4 h-4 text-amber-300 animate-bounce fill-amber-300" />
            <span>🔥 Ahorro Extremo Siempre ON</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-200 bg-gradient-to-r from-slate-900 to-[#1E1B4B] border border-indigo-500/30 px-4 py-2.5 rounded-2xl text-xs font-sans font-bold shadow-lg shadow-indigo-500/5 shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>Inflación vs Cuotas • Tiempo Real</span>
          </div>
        </div>
      </div>
    </header>
  );
}

