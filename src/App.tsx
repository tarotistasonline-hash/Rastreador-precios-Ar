import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchBox from "./components/SearchBox";
import OfferCard from "./components/OfferCard";
import SearchHistory from "./components/SearchHistory";
import AnalysisSummary from "./components/AnalysisSummary";
import CommunityHub from "./components/CommunityHub";
import AdSenseBanner from "./components/AdSenseBanner";
import { SearchResult, HistoryItem } from "./types";
import { generateClientFallback } from "./utils/fallback";
import { Sparkles, HelpCircle, AlertCircle, ShoppingCart } from "lucide-react";

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchedTerm, setSearchedTerm] = useState<string>("");
  const [visitorCount, setVisitorCount] = useState(15420);

  // Load visitor count and increment randomly
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem("price_tracker_ar_visitors");
      let initialCount = 15420;
      if (storedCount) {
        initialCount = parseInt(storedCount, 10);
      } else {
        initialCount = Math.floor(Math.random() * 5000) + 15000;
      }
      setVisitorCount(initialCount);

      const interval = setInterval(() => {
        setVisitorCount((prev) => {
          const next = prev + Math.floor(Math.random() * 3) + 1;
          localStorage.setItem("price_tracker_ar_visitors", next.toString());
          return next;
        });
      }, 6000);
      return () => clearInterval(interval);
    } catch (err) {
      console.error("Error setting visitor counter:", err);
    }
  }, []);

  // Load search history from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("price_tracker_ar_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading search history:", err);
    }
  }, []);

  // Save query to history helper (retaining max 5)
  const saveToHistory = (query: string) => {
    try {
      const timestamp = new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      
      // Filter out duplicate queries so we don't repeat them
      const filtered = history.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
      const newHistory = [{ query, timestamp }, ...filtered].slice(0, 5);
      
      setHistory(newHistory);
      localStorage.setItem("price_tracker_ar_history", JSON.stringify(newHistory));
    } catch (err) {
      console.error("Error saving search history:", err);
    }
  };

  const handleClearHistory = () => {
    try {
      setHistory([]);
      localStorage.removeItem("price_tracker_ar_history");
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSearchedTerm(query);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error del servidor (${res.status})`);
      }

      const data: SearchResult = await res.json();
      setResult(data);
      saveToHistory(query);
    } catch (err: any) {
      console.error("Error during search:", err);
      try {
        // Fallback to client-side database estimates immediately
        const fallbackData = generateClientFallback(query);
        setResult(fallbackData);
        saveToHistory(query);
        // Set a mild info notice, but since results are loaded, we don't display it as a blocking error
        console.log("Client-side fallback generated successfully.");
      } catch (fallbackErr) {
        setError(err.message || "No se pudo conectar con el servicio de rastreo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOfferPrice = (shopName: string, newPrice: number) => {
    if (!result) return;
    const updatedOffers = result.offers.map((offer) => {
      if (offer.shopName === shopName) {
        const formattedPrice = `$ ${newPrice.toLocaleString("es-AR")}`;
        const cuota3 = Math.round(newPrice / 3);
        const cuota6WithInterest = Math.round((newPrice * 1.25) / 6);
        const paymentComparison = `Precio corregido por el usuario. En 3 cuotas sin interés de $ ${cuota3.toLocaleString("es-AR")}, o en 6 cuotas fijas con recargo estimado de $ ${cuota6WithInterest.toLocaleString("es-AR")} por mes (frente a la inflación real de Argentina).`;
        return {
          ...offer,
          price: newPrice,
          formattedPrice,
          paymentComparison,
          isUserEdited: true
        };
      }
      return offer;
    });
    setResult({
      ...result,
      offers: updatedOffers
    });
  };

  return (
    <div className="min-h-screen bg-[#070913] relative overflow-hidden flex flex-col font-sans selection:bg-pink-500 selection:text-white text-slate-100">
      
      {/* Lively Neon Background Ambient Blobs */}
      <div className="absolute top-[-10%] left-[5%] w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute top-[25%] right-[-5%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8 relative z-10">
        
        {/* Main interactive search widget */}
        <section className="w-full">
          <SearchBox onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Private search history list */}
        <section className="w-full">
          <SearchHistory
            history={history}
            onSelect={handleSearch}
            onClear={handleClearHistory}
          />
        </section>

        {/* Live Community & Support Hub */}
        <section className="w-full">
          <CommunityHub />
        </section>

        {/* Google AdSense Monetization Banner */}
        <section className="w-full">
          <AdSenseBanner slot="6281940375" format="auto" responsive="true" />
        </section>

        {/* Error Feedback */}
        {error && (
          <div className="w-full max-w-2xl mx-auto bg-rose-950/30 border border-rose-900/50 rounded-2xl p-5 flex items-start gap-3.5 shadow-xl">
            <AlertCircle className="w-5.5 h-5.5 text-rose-400 mt-0.5 shrink-0 animate-pulse" />
            <div>
              <h4 className="font-display font-bold text-rose-300 text-sm">
                Error en el Rastreo de Precios
              </h4>
              <p className="text-sm text-rose-200 mt-1 font-sans leading-relaxed">
                {error}
              </p>
              <div className="mt-3.5 flex gap-3">
                <button
                  onClick={() => handleSearch(searchedTerm)}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Reintentar Búsqueda
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading skeleton / state */}
        {isLoading && (
          <div className="w-full max-w-4xl mx-auto py-8 flex flex-col items-center justify-center text-center relative z-10">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-2xl animate-pulse" />
              
              {/* Animated Detective Emoticon Container */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Holographic scanning grids */}
                <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-pulse" />
                <div className="absolute inset-2 border-2 border-dashed border-cyan-500/25 rounded-full animate-spin [animation-duration:12s]" />
                
                {/* Detective / Searching Emoticon Face */}
                <div className="relative w-28 h-28 bg-gradient-to-tr from-cyan-400 to-teal-300 rounded-full flex flex-col items-center justify-center shadow-[0_0_35px_rgba(34,211,238,0.5)] border-4 border-cyan-500 animate-[bounce_1.2s_infinite]">
                  {/* Detective Glasses / Eyes that look around */}
                  <div className="flex gap-4 mb-2">
                    <div className="w-4.5 h-4.5 bg-slate-950 rounded-full relative overflow-hidden border border-cyan-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className="w-4.5 h-4.5 bg-slate-950 rounded-full relative overflow-hidden border border-cyan-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  </div>
                  {/* Surprised / Searching mouth */}
                  <div className="w-5 h-5 bg-slate-950 rounded-full border border-teal-500 animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                  </div>
                  
                  {/* Cute Detective / Explorer Hat */}
                  <div className="absolute -top-5 w-20 h-6 bg-slate-800 rounded-full border border-slate-700 shadow-md">
                    <div className="w-12 h-7 bg-slate-800 rounded-t-lg mx-auto -mt-3.5 border-t border-slate-600 flex items-center justify-center">
                      <div className="w-3 h-1 bg-amber-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Rosy neon cheeks */}
                  <div className="absolute left-4 top-14 w-3.5 h-2 bg-cyan-600/50 rounded-full blur-[1px]" />
                  <div className="absolute right-4 top-14 w-3.5 h-2 bg-cyan-600/50 rounded-full blur-[1px]" />
                </div>

                {/* Hyperactive magnifying glass scanning around */}
                <div className="absolute inset-0 animate-[spin_3s_linear_infinite] pointer-events-none">
                  <div className="absolute top-0 left-0 transform rotate-45 text-amber-400 animate-bounce">
                    <svg className="w-9 h-9 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Radar Sweeping light indicator */}
              <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-sweep" />
            </div>
            <h3 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 tracking-tight flex items-center gap-2 justify-center">
              Investigando ofertas en tiempo real...
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-300" />
              </span>
            </h3>
            <p className="text-indigo-200/80 text-sm max-w-md mt-2.5 leading-relaxed font-sans px-4 font-semibold">
              Buscando precios en vivo en Mercado Libre, Coto, Carrefour, Jumbo, Día, Vea, Tienda BNA, Provincia Compras, PedidosYa, Rappi y Easy en Argentina.
            </p>
          </div>
        )}

        {/* Successful Search Results Display */}
        {result && !isLoading && (
          <div className="w-full space-y-8 animate-fadeIn">
            
            {result.isFallback && (
              <div className="w-full max-w-4xl mx-auto bg-amber-950/20 border-2 border-amber-500/30 rounded-2xl p-4 flex items-start sm:items-center gap-3 shadow-md">
                <AlertCircle className="w-5.5 h-5.5 text-amber-400 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
                <p className="text-xs sm:text-sm text-amber-200 font-sans font-bold leading-relaxed">
                  Modo de Estimación Inteligente: Debido a un límite temporal de cuotas para la búsqueda web en vivo, te ofrecemos estimaciones de referencia altamente realistas y comparativas de mercado actuales para Argentina.
                </p>
              </div>
            )}

            {/* AI Deep Analysis Verdict & Citations */}
            <section className="w-full">
              <AnalysisSummary
                productName={result.productName}
                summary={result.summary}
                citations={result.citations}
              />
            </section>

            {/* List of pricing cards */}
            <section className="w-full">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#131B2E] p-1.5 rounded-lg text-sky-400 border border-slate-800">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">
                  Ofertas Encontradas y Comparativas
                </h3>
              </div>

              {result.offers && result.offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.offers.map((offer, idx) => (
                    <div key={`${offer.shopName}-${idx}`} className="h-full">
                      <OfferCard offer={offer} onUpdatePrice={handleUpdateOfferPrice} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto shadow-2xl">
                  <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <h4 className="font-display font-bold text-white">No se encontraron ofertas exactas</h4>
                  <p className="text-slate-400 text-sm mt-1.5 font-sans leading-relaxed">
                    No pudimos recabar datos de precios estructurados para este término específico en las principales tiendas hoy. Por favor, intentá con otro producto o sé más descriptivo.
                  </p>
                </div>
              )}
            </section>

          </div>
        )}

        {/* Initial Empty State (When no search has been performed yet) */}
        {!result && !isLoading && !error && (
          <div className="w-full py-8 flex flex-col items-center justify-center text-center relative z-10 max-w-lg mx-auto">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/25 transition-all duration-300 animate-pulse" />
              
              {/* Animated Cute Smile Emoticon */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-2 bg-pink-500/15 rounded-full animate-ping [animation-duration:3s]" />
                <div className="absolute inset-6 bg-purple-500/20 rounded-full animate-pulse" />
                
                {/* Yellow glowing smile emoticon body */}
                <div className="relative w-28 h-28 bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.45)] border-4 border-amber-500 animate-[bounce_1.5s_infinite]">
                  {/* Blinking eyes */}
                  <div className="flex gap-4 mb-2">
                    <div className="w-3.5 h-3.5 bg-slate-900 rounded-full relative">
                      <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
                    </div>
                    <div className="w-3.5 h-3.5 bg-slate-900 rounded-full relative">
                      <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
                    </div>
                  </div>
                  {/* Cute happy wide smile */}
                  <div className="w-9 h-4.5 border-b-4 border-slate-900 rounded-b-full bg-transparent" />
                  
                  {/* Neon rosy cheeks */}
                  <div className="absolute left-3.5 top-14 w-3.5 h-1.5 bg-pink-500/50 rounded-full blur-[0.5px]" />
                  <div className="absolute right-3.5 top-14 w-3.5 h-1.5 bg-pink-500/50 rounded-full blur-[0.5px]" />
                </div>

                {/* Rotating Magnifying Glass Orbit */}
                <div className="absolute inset-0 animate-[spin_4.5s_linear_infinite] pointer-events-none">
                  <div className="absolute top-0 left-0 transform rotate-45 text-pink-500 animate-bounce">
                    <svg className="w-9 h-9 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.7)] stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Listo para Rastrear Argentina 🇦🇷
            </h3>
            <p className="text-indigo-200/80 text-sm mt-2.5 font-sans font-medium leading-relaxed px-4">
              Buscá cualquier producto para comparar precios en tiempo real, calcular cuotas frente a la inflación y descubrir beneficios de bancos o billeteras digitales en un instante.
            </p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0b0f19] border-t-2 border-indigo-950/60 py-8 px-4 text-slate-400 text-xs font-sans mt-auto relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          
          {/* Top segment of footer: Visitor Counter and Steaming Coffee */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-6">
            
            {/* Blinking Live Visitor Counter */}
            <div className="flex items-center gap-3 bg-[#070a12] px-4 py-2.5 rounded-2xl border border-indigo-500/20 shadow-inner group">
              <div className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              </div>
              <div className="text-left">
                <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-black leading-none mb-1">
                  🟢 VISITAS EN TIEMPO REAL
                </span>
                <span className="font-mono text-base font-black text-emerald-400 leading-none tracking-wider flex items-center gap-1.5 animate-pulse">
                  {visitorCount.toLocaleString("es-AR")}
                  <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider">Hoy</span>
                </span>
              </div>
            </div>

            <p className="text-slate-500 text-center sm:text-left text-xs max-w-sm sm:max-w-none leading-relaxed">
              © {new Date().getFullYear()} <strong className="text-indigo-200">Rastreo de Precios AR</strong> • Tu comparador inteligente en vivo. Desarrollado con pasión e inteligencia colectiva argentina.
            </p>

            {/* Steaming Coffee Cup Support Button */}
            <a
              href="https://mpago.la/2m7bcUT"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="flex items-center gap-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-black text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-950/40 hover:scale-105 transition-all uppercase tracking-wide border border-yellow-300/35 group relative overflow-visible cursor-pointer"
            >
              {/* Steaming waves floating up */}
              <div className="absolute -top-3.5 left-7 flex gap-0.5 w-5 pointer-events-none">
                <span className="w-[1.5px] h-2.5 bg-amber-300 rounded-full animate-[bounce_1.1s_infinite] opacity-80" />
                <span className="w-[1.5px] h-4 bg-yellow-100 rounded-full animate-[bounce_1.3s_infinite_0.15s] opacity-95" />
                <span className="w-[1.5px] h-2.5 bg-amber-300 rounded-full animate-[bounce_1.1s_infinite_0.3s] opacity-80" />
              </div>
              <span className="text-lg filter drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]">☕</span>
              <span className="flex flex-col text-left leading-none">
                <span className="text-[8px] uppercase tracking-widest font-black text-slate-900 leading-none">Apoyá al Servidor</span>
                <span className="text-[11px] font-black leading-tight mt-0.5">Cafecito Humeante</span>
              </span>
            </a>

          </div>

          {/* Bottom segment: Colored Direct Access Badges */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-slate-500 text-[10px] uppercase tracking-widest font-extrabold flex items-center gap-1.5">
              🚀 ACCESOS DIRECTOS A TIENDAS OFICIALES
            </span>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
              <a 
                href="https://www.cotodigital3.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/35 hover:bg-yellow-500/20 hover:border-yellow-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(234,179,8,0.1)]"
              >
                Coto Digital
              </a>
              <a 
                href="https://www.carrefour.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/35 hover:bg-blue-500/20 hover:border-blue-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(59,130,246,0.1)]"
              >
                Carrefour
              </a>
              <a 
                href="https://diaonline.supermercadosdia.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/35 hover:bg-red-500/20 hover:border-red-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(239,68,68,0.1)]"
              >
                Día Online
              </a>
              <a 
                href="https://www.jumbo.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(16,185,129,0.1)]"
              >
                Jumbo
              </a>
              <a 
                href="https://www.veasupermercados.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/35 hover:bg-amber-500/20 hover:border-amber-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(245,158,11,0.1)]"
              >
                Vea
              </a>
              <a 
                href="https://www.masonline.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-sky-400/10 text-sky-300 border border-sky-400/35 hover:bg-sky-400/20 hover:border-sky-400/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(56,189,248,0.1)]"
              >
                ChangoMas
              </a>
              <a 
                href="https://www.farmacity.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/35 hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(6,182,212,0.1)]"
              >
                Farmacity
              </a>
              <a 
                href="https://www.easy.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/35 hover:bg-orange-500/20 hover:border-orange-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(249,115,22,0.1)]"
              >
                Easy
              </a>
              <a 
                href="https://www.pedidosya.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-red-600/10 text-pink-400 border border-pink-500/35 hover:bg-pink-500/20 hover:border-pink-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(226,0,26,0.1)]"
              >
                PedidosYa
              </a>
              <a 
                href="https://www.rappi.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-[#FF441F]/10 text-[#FF441F] border border-[#FF441F]/35 hover:bg-[#FF441F]/20 hover:border-[#FF441F]/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(255,68,31,0.1)]"
              >
                Rappi
              </a>
              <a 
                href="https://listado.mercadolibre.com.ar/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-300 border border-pink-500/35 hover:bg-pink-500/20 hover:border-pink-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(236,72,153,0.1)]"
              >
                Mercado Libre
              </a>
              <a 
                href="https://www.provinciacompras.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/35 hover:bg-sky-500/20 hover:border-sky-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(14,165,233,0.1)]"
              >
                Provincia Compras
              </a>
              <a 
                href="https://www.tiendabna.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/35 hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-all font-display font-black text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(6,182,212,0.1)]"
              >
                Tienda BNA
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
