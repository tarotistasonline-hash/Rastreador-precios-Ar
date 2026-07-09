import { Brain, Sparkles, TrendingUp, HelpCircle } from "lucide-react";

interface AnalysisSummaryProps {
  productName: string;
  summary: string;
  citations?: { title: string; uri: string }[];
}

export default function AnalysisSummary({ productName, summary, citations }: AnalysisSummaryProps) {
  return (
    <div className="w-full bg-gradient-to-br from-[#12113D] via-[#090C16] to-[#04060C] border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl shadow-indigo-500/10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b-2 border-indigo-950/60 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 text-white p-3 rounded-2xl shadow-xl shadow-purple-500/20">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-white tracking-tight">
              Análisis Inteligente AR ⚡
            </h3>
            <p className="text-xs text-indigo-300/90 font-sans font-bold uppercase tracking-wider">
              Monitoreo y recomendación de financiación según inflación local
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#060810] border-2 border-indigo-500/30 px-4 py-2 rounded-2xl self-start sm:self-center shadow-inner">
          <TrendingUp className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-black text-pink-300 truncate">
            {productName}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="text-xs font-black text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            VEREDICTO IA PARA COMPRA INTELIGENTE:
          </h4>
          <div className="bg-[#05070f]/95 border-2 border-indigo-950 p-5 rounded-2xl">
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans whitespace-pre-wrap font-semibold">
              {summary}
            </p>
          </div>
        </div>

        {/* Citations / Grounding sources */}
        {citations && citations.length > 0 && (
          <div className="pt-4 border-t border-indigo-950/60 mt-4">
            <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest block mb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Fuentes Consultadas en Vivo:
            </span>
            <div className="flex flex-wrap gap-2">
              {citations.map((cite, i) => (
                <a
                  key={cite.uri + i}
                  href={cite.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="text-xs bg-[#060810] hover:bg-indigo-950/40 border border-indigo-500/30 hover:border-pink-500 hover:text-pink-300 text-indigo-200 px-4 py-2 rounded-xl transition-all flex items-center gap-2 truncate max-w-xs font-sans font-bold shadow-inner"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 animate-ping" />
                  <span className="truncate">{cite.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
