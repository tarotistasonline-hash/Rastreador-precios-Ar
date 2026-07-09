import { History, Trash2, ArrowRight } from "lucide-react";
import { HistoryItem } from "../types";

interface SearchHistoryProps {
  history: HistoryItem[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

export default function SearchHistory({ history, onSelect, onClear }: SearchHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#13172E] to-[#0D1021] border-2 border-indigo-500/20 rounded-2xl p-5 max-w-2xl mx-auto shadow-xl shadow-black/25">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-indigo-200">
          <History className="w-4 h-4 text-pink-400" />
          <h3 className="text-xs font-black uppercase tracking-widest font-sans">
            BÚSQUEDAS RECIENTES (PRIVADAS) ⏳
          </h3>
        </div>
        <button
          onClick={onClear}
          id="clear-history-btn"
          className="text-xs text-rose-400 hover:text-rose-300 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpiar</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {history.map((item, index) => (
          <button
            key={`${item.query}-${index}`}
            onClick={() => onSelect(item.query)}
            id={`history-item-${index}`}
            className="w-full flex items-center justify-between text-left px-4 py-3 bg-[#080B14] hover:bg-pink-950/15 border border-indigo-950 hover:border-pink-500 rounded-xl transition-all cursor-pointer group text-sm text-slate-300 hover:text-pink-300 shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-black text-pink-300 bg-pink-950/20 w-5.5 h-5.5 rounded-lg flex items-center justify-center shrink-0 border border-pink-500/30">
                {index + 1}
              </span>
              <span className="font-sans font-bold truncate">{item.query}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-pink-400 shrink-0">
              <span className="hidden sm:inline font-mono font-bold">{item.timestamp}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 stroke-[2.5px]" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
