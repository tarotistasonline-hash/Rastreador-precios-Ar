import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, 
  Settings, 
  Mail, 
  ExternalLink, 
  ShoppingBag, 
  Sparkles, 
  Save, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  HelpCircle,
  TrendingDown,
  Percent
} from "lucide-react";
import { trackEvent } from "../utils/mixpanel";

// Predefined Interface for Sponsor Ads
export interface SponsorAdConfig {
  type: "default" | "mercadolibre" | "custom";
  title: string;
  description: string;
  linkUrl: string;
  buttonText: string;
  imageUrl?: string;
  badgeText?: string;
  themeColor: string; // 'purple' | 'yellow' | 'emerald' | 'cyan'
}

export default function SponsorBanner() {
  const [adConfig, setAdConfig] = useState<SponsorAdConfig>({
    type: "default",
    title: "¡Tu Publicidad Aquí! 🚀",
    description: "Impulsá tu marca, tienda o productos ante miles de usuarios activos que buscan ahorrar. Posicionamiento inmediato garantizado.",
    linkUrl: "mailto:azulbaires@gmail.com?subject=Consulta de Patrocinio - Rastreo de Precios AR",
    buttonText: "Anunciate Hoy",
    themeColor: "purple",
    badgeText: "SPONSOR CORNER"
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for the customization
  const [formType, setFormType] = useState<"default" | "mercadolibre" | "custom">("default");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formButtonText, setFormButtonText] = useState("");
  const [formBadgeText, setFormBadgeText] = useState("");
  const [formThemeColor, setFormThemeColor] = useState("purple");
  const [formImageUrl, setFormImageUrl] = useState("");

  // Load configuration from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sponsor_ad_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setAdConfig(parsed);
        // Initialize form states with current config
        setFormType(parsed.type);
        setFormTitle(parsed.title);
        setFormDescription(parsed.description);
        setFormLinkUrl(parsed.linkUrl);
        setFormButtonText(parsed.buttonText);
        setFormBadgeText(parsed.badgeText || "");
        setFormThemeColor(parsed.themeColor);
        setFormImageUrl(parsed.imageUrl || "");
      } else {
        resetToDefaultFormStates();
      }
    } catch (e) {
      console.error("Error loading sponsor ad config:", e);
    }
  }, []);

  const resetToDefaultFormStates = () => {
    setFormType("default");
    setFormTitle("¡Tu Publicidad Aquí! 🚀");
    setFormDescription("Impulsá tu marca, tienda o productos ante miles de usuarios activos que buscan ahorrar. Posicionamiento inmediato garantizado.");
    setFormLinkUrl("mailto:azulbaires@gmail.com?subject=Consulta de Patrocinio - Rastreo de Precios AR");
    setFormButtonText("Anunciate Hoy");
    setFormBadgeText("SPONSOR CORNER");
    setFormThemeColor("purple");
    setFormImageUrl("");
  };

  const handleApplyPreset = (presetType: "default" | "mercadolibre") => {
    if (presetType === "default") {
      setFormType("default");
      setFormTitle("¡Tu Publicidad Aquí! 🚀");
      setFormDescription("Impulsá tu marca, tienda o productos ante miles de usuarios activos que buscan ahorrar. Posicionamiento inmediato garantizado.");
      setFormLinkUrl("mailto:azulbaires@gmail.com?subject=Consulta de Patrocinio - Rastreo de Precios AR");
      setFormButtonText("Consultar por Mail");
      setFormBadgeText("ANUNCIATE");
      setFormThemeColor("purple");
      setFormImageUrl("");
    } else if (presetType === "mercadolibre") {
      setFormType("mercadolibre");
      setFormTitle("🛒 Mercado Libre AR - Especial Tecnología");
      setFormDescription("Aprovechá hasta 12 cuotas sin interés en Notebooks, Smartphones y Televisores seleccionados con envío gratis hoy mismo.");
      setFormLinkUrl("https://www.mercadolibre.com.ar");
      setFormButtonText("Ver Ofertas Meli");
      setFormBadgeText("OFERTA DESTACADA");
      setFormThemeColor("yellow");
      setFormImageUrl("https://http2.mlstatic.com/frontend-assets/ml-web-navigation/sandrow/v3.0.0/logo_ml_3x.png");
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: SponsorAdConfig = {
      type: formType,
      title: formTitle.trim() || "Anuncio",
      description: formDescription.trim() || "Descripción del patrocinador",
      linkUrl: formLinkUrl.trim() || "https://www.mercadolibre.com.ar",
      buttonText: formButtonText.trim() || "Saber más",
      badgeText: formBadgeText.trim() || "PATROCINADO",
      themeColor: formThemeColor,
      imageUrl: formImageUrl.trim() || undefined
    };

    try {
      localStorage.setItem("sponsor_ad_config", JSON.stringify(newConfig));
      setAdConfig(newConfig);
      setIsConfigOpen(false);
      setSuccessMsg("¡Anuncio configurado y actualizado con éxito!");
      
      trackEvent("sponsor_ad_configured", {
        ad_type: newConfig.type,
        theme_color: newConfig.themeColor,
        has_custom_image: !!newConfig.imageUrl
      });

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error saving ad config:", err);
    }
  };

  const handleResetConfig = () => {
    try {
      localStorage.removeItem("sponsor_ad_config");
      resetToDefaultFormStates();
      const defaultConfig: SponsorAdConfig = {
        type: "default",
        title: "¡Tu Publicidad Aquí! 🚀",
        description: "Impulsá tu marca, tienda o productos ante miles de usuarios activos que buscan ahorrar. Posicionamiento inmediato garantizado.",
        linkUrl: "mailto:azulbaires@gmail.com?subject=Consulta de Patrocinio - Rastreo de Precios AR",
        buttonText: "Anunciate Hoy",
        themeColor: "purple",
        badgeText: "SPONSOR CORNER"
      };
      setAdConfig(defaultConfig);
      setIsConfigOpen(false);
      setSuccessMsg("Se restableció el anuncio por defecto");
      
      trackEvent("sponsor_ad_reset_to_default");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error resetting config:", err);
    }
  };

  // Helper for background/border styles based on themeColor
  const getThemeStyles = (color: string) => {
    switch (color) {
      case "yellow": // Mercado Libre yellow vibe
        return {
          cardBg: "bg-gradient-to-br from-[#FFE600]/10 via-slate-900/90 to-slate-950",
          border: "border-yellow-400/40 hover:border-yellow-400/80 shadow-[0_4px_25px_rgba(255,230,0,0.06)]",
          badgeBg: "bg-[#FFE600] text-slate-950",
          buttonBg: "bg-[#FFE600] hover:bg-[#FFE600]/90 text-slate-950",
          glow: "bg-yellow-500/10",
          textColor: "text-yellow-300"
        };
      case "emerald":
        return {
          cardBg: "bg-gradient-to-br from-emerald-500/10 via-slate-900/90 to-slate-950",
          border: "border-emerald-500/40 hover:border-emerald-500/80 shadow-[0_4px_25px_rgba(16,185,129,0.06)]",
          badgeBg: "bg-emerald-500 text-slate-950",
          buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-slate-950",
          glow: "bg-emerald-500/10",
          textColor: "text-emerald-400"
        };
      case "cyan":
        return {
          cardBg: "bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-slate-950",
          border: "border-cyan-500/40 hover:border-cyan-500/80 shadow-[0_4px_25px_rgba(6,182,212,0.06)]",
          badgeBg: "bg-cyan-500 text-slate-950",
          buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-slate-950",
          glow: "bg-cyan-500/10",
          textColor: "text-cyan-400"
        };
      case "purple":
      default:
        return {
          cardBg: "bg-gradient-to-br from-purple-600/10 via-slate-900/90 to-slate-950",
          border: "border-purple-500/40 hover:border-purple-500/80 shadow-[0_4px_25px_rgba(168,85,247,0.06)]",
          badgeBg: "bg-purple-600 text-white",
          buttonBg: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white",
          glow: "bg-purple-500/10",
          textColor: "text-purple-400"
        };
    }
  };

  const styles = getThemeStyles(adConfig.themeColor);

  return (
    <div className="w-full font-sans" id="sponsor-banner-container">
      {/* Toast Notification for quick feedback */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        {/* Glow Element */}
        <div className={`absolute -inset-0.5 rounded-3xl ${styles.glow} blur-lg group-hover:opacity-100 transition duration-1000 -z-10`} />

        {/* Ad Card */}
        <div className={`w-full ${styles.cardBg} border ${styles.border} rounded-3xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6`}>
          
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

          {/* Ad Content */}
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-center sm:items-start gap-4.5 text-center sm:text-left z-10">
            {/* Ad Icon/Logo */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-slate-800 bg-[#0c1024]/90 relative group-hover:scale-105 transition-transform duration-300 shadow-md`}>
              {adConfig.imageUrl ? (
                <img 
                  src={adConfig.imageUrl} 
                  alt="Sponsor Logo" 
                  className="max-w-[80%] max-h-[80%] object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : adConfig.type === "mercadolibre" ? (
                <ShoppingBag className="w-7 h-7 text-yellow-400" />
              ) : (
                <Megaphone className={`w-7 h-7 ${styles.textColor} animate-pulse`} />
              )}
              {/* Little sparkles for premium look */}
              <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1 animate-spin [animation-duration:8s]" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full ${styles.badgeBg} shadow-sm font-sans shrink-0`}>
                  {adConfig.badgeText || "PATROCINADO"}
                </span>
                
                {adConfig.type === "default" && (
                  <span className="text-[10px] font-medium text-slate-500 font-sans">
                    Contacto: <strong className="text-purple-400 hover:underline">azulbaires@gmail.com</strong>
                  </span>
                )}
              </div>
              
              <h4 className="font-display font-black text-slate-100 text-base sm:text-lg leading-tight tracking-tight">
                {adConfig.title}
              </h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-2xl">
                {adConfig.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-3 shrink-0 w-full sm:w-auto md:w-full lg:w-auto z-10">
            {/* Edit / Config Trigger */}
            <button
              onClick={() => {
                setIsConfigOpen(!isConfigOpen);
                trackEvent("sponsor_config_clicked");
              }}
              className="w-full sm:w-auto md:w-full lg:w-auto px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-[#131a30] text-slate-400 hover:text-white border border-indigo-950/60 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
              title="Configurar Anuncio o Preset"
              id="sponsor-settings-btn"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Configurar</span>
            </button>

            {/* Target Link */}
            <a
              href={adConfig.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent("sponsor_ad_clicked", {
                  ad_title: adConfig.title,
                  ad_type: adConfig.type,
                  ad_link: adConfig.linkUrl
                });
              }}
              className={`w-full sm:w-auto md:w-full lg:w-auto px-5 py-2.5 rounded-2xl ${styles.buttonBg} text-xs font-display font-black uppercase tracking-wider transition-all hover:scale-103 active:scale-97 shadow-lg flex items-center justify-center gap-2 select-none cursor-pointer`}
              id="sponsor-action-link"
            >
              {adConfig.type === "default" ? (
                <Mail className="w-4 h-4" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              <span>{adConfig.buttonText}</span>
            </a>
          </div>

        </div>

        {/* Dynamic Ad Configuration Panel (Expandable Drawer) */}
        <AnimatePresence>
          {isConfigOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden mt-4"
              id="sponsor-config-panel"
            >
              <div className="bg-[#090C1A] border border-indigo-950 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-indigo-950 pb-4">
                  <div>
                    <h5 className="font-display font-extrabold text-sm text-indigo-200 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-400" />
                      Gestor de Anuncios y Patrocinio
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Personalizá este banner con presets rápidos de Mercado Libre o cargá tu propio anuncio.
                    </p>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("default")}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-950/50 text-purple-300 hover:bg-purple-950 border border-purple-500/30 text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Preset: Sponsor Default
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("mercadolibre")}
                      className="px-2.5 py-1.5 rounded-xl bg-yellow-950/40 text-yellow-300 hover:bg-yellow-950/80 border border-yellow-500/30 text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Percent className="w-3 h-3 text-yellow-400" /> Preset: Meli Promo
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  {/* Grid for Form Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Select Ad Type */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tipo de Anuncio
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full bg-[#0C1024] border border-indigo-950 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option value="default">Por Defecto (Sponsor con Mail)</option>
                        <option value="mercadolibre">Mercado Libre (Ofertas)</option>
                        <option value="custom">Completamente Personalizado</option>
                      </select>
                    </div>

                    {/* Badge Text */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Texto de Etiqueta (Badge)
                      </label>
                      <input
                        type="text"
                        value={formBadgeText}
                        onChange={(e) => setFormBadgeText(e.target.value)}
                        placeholder="Ej: MEJOR PRECIO, PUBLICIDAD, SPONSOR"
                        className="w-full bg-[#0C1024] border border-indigo-950 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-700"
                      />
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Título del Anuncio
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Escribí un título llamativo..."
                        required
                        className="w-full bg-[#0C1024] border border-indigo-950 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-700"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Descripción detallada
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Explicá la oferta o llamada a la acción de manera concisa..."
                        rows={3}
                        required
                        className="w-full bg-[#0C1024] border border-indigo-950 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-700"
                      />
                    </div>

                    {/* Link URL */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Enlace de Destino (URL o Mailto)
                      </label>
                      <input
                        type="text"
                        value={formLinkUrl}
                        onChange={(e) => setFormLinkUrl(e.target.value)}
                        placeholder="Ej: https://mercadolibre.com.ar/oferta o mailto:..."
                        required
                        className="w-full bg-[#0C1024] border border-indigo-950 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-700"
                      />
                    </div>

                    {/* Button Text */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Texto del Botón
                      </label>
                      <input
                        type="text"
                        value={formButtonText}
                        onChange={(e) => setFormButtonText(e.target.value)}
                        placeholder="Ej: Ver Oferta, Comprar, Consultar"
                        required
                        className="w-full bg-[#0C1024] border border-indigo-950 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-700"
                      />
                    </div>

                    {/* Image URL */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        URL de Imagen / Logo (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="Dejar vacío para usar ícono predeterminado"
                        className="w-full bg-[#0C1024] border border-indigo-950 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-700"
                      />
                    </div>

                    {/* Color Theme */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tema de Color (Vibe)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {["purple", "yellow", "emerald", "cyan"].map((color) => {
                          let label = "Violeta";
                          let colorClass = "bg-purple-600";
                          if (color === "yellow") { label = "Meli / Amarillo"; colorClass = "bg-yellow-400"; }
                          else if (color === "emerald") { label = "Esmeralda"; colorClass = "bg-emerald-500"; }
                          else if (color === "cyan") { label = "Celeste"; colorClass = "bg-cyan-400"; }

                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormThemeColor(color)}
                              className={`py-2 px-1.5 rounded-xl border text-[9px] font-bold flex flex-col items-center gap-1 transition-all select-none cursor-pointer ${
                                formThemeColor === color
                                  ? "border-white bg-[#0F132C]"
                                  : "border-indigo-950 bg-slate-950/40 hover:bg-slate-900/40"
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full ${colorClass}`} />
                              <span className="text-slate-400 truncate w-full text-center">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Actions Bar inside configuration */}
                  <div className="pt-4 border-t border-indigo-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleResetConfig}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-900 text-rose-400 hover:text-rose-300 border border-rose-950 rounded-2xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                      title="Restaurar valores del sponsor inicial"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Restablecer Default</span>
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsConfigOpen(false)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-950 hover:bg-[#131a30] text-slate-400 border border-indigo-950 rounded-2xl text-xs font-display font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Cambios</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
