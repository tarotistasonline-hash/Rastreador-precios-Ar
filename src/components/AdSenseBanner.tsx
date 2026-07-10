import { useEffect, useRef, useState } from "react";

interface AdSenseBannerProps {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  responsive?: "true" | "false";
  className?: string;
}

export default function AdSenseBanner({
  slot = "default-slot-123456",
  format = "auto",
  responsive = "true",
  className = "",
}: AdSenseBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);
  const initializedRef = useRef(false);

  // Retrieve AdSense Client ID from environment variables, fallback to the user's provided Publisher ID
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-8099027931324700";
  const isDemo = !clientId || clientId === "ca-pub-1234567890123456";

  useEffect(() => {
    // If in demo mode, do not inject scripts or attempt layout pushes
    if (isDemo) {
      return;
    }

    // 1. Inject the global AdSense script once if a valid clientId exists
    const existingScript = document.querySelector(
      `script[src*="pagead2.googlesyndication.com"]`
    );

    if (!existingScript && clientId) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // 2. Safe layout initialization function
    const initializeAd = () => {
      if (initializedRef.current) return;

      const element = adRef.current;
      if (!element) return;

      // Check if AdSense already initialized this element to avoid duplicate push errors
      if (element.getAttribute("data-adsbygoogle-status") === "done") {
        initializedRef.current = true;
        setAdLoaded(true);
        return;
      }

      // Check if width is available yet (avoid "availableWidth=0" error)
      if (element.offsetWidth === 0) {
        // Retry shortly once container gets populated/rendered in DOM
        const retryTimer = setTimeout(initializeAd, 300);
        return () => clearTimeout(retryTimer);
      }

      try {
        if (typeof window !== "undefined") {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initializedRef.current = true;
          setAdLoaded(true);
        }
      } catch (err) {
        console.warn("Google AdSense: Error during adsbygoogle.push()", err);
      }
    };

    // Delay initialization slightly to guarantee the layout is calculated & rendered in DOM
    const timer = setTimeout(initializeAd, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [clientId, slot, isDemo]);

  return (
    <div className={`w-full max-w-4xl mx-auto my-6 relative z-10 px-4 ${className}`} id={`adsense-container-${slot}`}>
      {/* Visual outer frame designed to mimic high-end editorial layouts */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0d1221] via-[#151c36] to-[#0d1221] border border-indigo-500/15 p-3 overflow-hidden shadow-lg shadow-indigo-950/20 group">
        
        {/* Glow accent */}
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Humble Ad indicator label */}
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-indigo-500/10">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/25">
            Anuncio Patrocinado
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            Google AdSense • {isDemo ? "Modo Demostración" : "En Vivo"}
          </span>
        </div>

        {/* Ad Unit Container */}
        <div className="min-h-[90px] w-full flex items-center justify-center bg-[#070b15]/60 rounded-xl relative overflow-hidden">
          
          {/* Real Ad Element (Only rendered if NOT in demo mode to prevent unsolicited AdSense TagErrors) */}
          {!isDemo ? (
            <ins
              ref={adRef}
              className="adsbygoogle block w-full"
              style={{ display: "block", textAlign: "center" }}
              data-ad-client={clientId}
              data-ad-slot={slot}
              data-ad-format={format}
              data-full-width-responsive={responsive}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none pointer-events-none bg-gradient-to-b from-[#080c18] to-[#04060c]">
              <div className="absolute -inset-10 bg-radial-gradient from-indigo-500/5 to-transparent blur-xl" />
              <div className="flex items-center gap-1.5 mb-1 text-indigo-300">
                <svg className="w-4 h-4 text-amber-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-display font-black text-xs uppercase tracking-wider">Espacio Publicitario AdSense</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans max-w-sm">
                Colocá tu ID de Editor en <strong className="text-pink-400 font-mono">VITE_ADSENSE_CLIENT_ID</strong> para activar anuncios reales en tu dominio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
