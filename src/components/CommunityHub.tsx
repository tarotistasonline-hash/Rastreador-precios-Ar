import React, { useState, useEffect } from "react";
import { Users, Sparkles, MessageSquare, ChevronDown, ChevronUp, Send, Heart, Flame, ShieldAlert, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { trackEvent } from "../utils/mixpanel";

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  storeTag?: string;
  promoTag?: string;
  likes: number;
}

export default function CommunityHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1284);
  const [searchesToday, setSearchesToday] = useState(4820);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newAuthor, setNewAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [selectedStore, setSelectedStore] = useState("General");
  const [selectedPromo, setSelectedPromo] = useState("General");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Simulates live active users & searches fluctuating in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(1240, Math.min(1390, prev + change));
      });
      setSearchesToday((prev) => prev + (Math.random() > 0.4 ? 1 : 0));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Prepopulate or load comments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("price_tracker_ar_community_comments");
      if (stored) {
        setComments(JSON.parse(stored));
      } else {
        const defaultComments: Comment[] = [
          {
            id: "1",
            author: "Marcos_Dev",
            text: "¡El yogur Ser Protein con Colágeno está de oferta esta semana en Carrefour! Si pagan los martes con Tarjeta Carrefour Prepaga, tienen 15% de descuento directo en el ticket. Termina quedando a un regalo comparado con el precio de góndola de otros lados.",
            timestamp: "Hace 5 min",
            storeTag: "Carrefour",
            promoTag: "Tarjeta Carrefour",
            likes: 12
          },
          {
            id: "2",
            author: "LorenaSanjuan",
            text: "Para los que buscan electro, Easy tiene 3 cuotas fijas excelentes con Plan Zeta de Naranja X y además hay envío gratis si compran online en productos seleccionados de calefacción. Ideal para ganarle a la inflación.",
            timestamp: "Hace 15 min",
            storeTag: "Easy",
            promoTag: "Naranja X",
            likes: 18
          },
          {
            id: "3",
            author: "Gaston_AR",
            text: "Acabo de comparar precios de fideos y aceite. Coto Digital sigue conviniendo muchísimo si tienen la tarjeta Comunidad Coto activa (te descuentan el 10% al instante). Si pagan con Mercado Pago (dinero en cuenta) los lunes, hay un reintegro extra.",
            timestamp: "Hace 42 min",
            storeTag: "Coto",
            promoTag: "Mercado Pago",
            likes: 7
          },
          {
            id: "4",
            author: "Meli_LaPlata",
            text: "No se olviden que con Cuenta DNI los sábados hay reintegro del 30% al 40% en carnicerías y comercios de barrio adheridos. A veces no figura directo en los grandes súper pero te salva el fin de semana.",
            timestamp: "Hace 1 hora",
            storeTag: "General",
            promoTag: "Cuenta DNI",
            likes: 24
          }
        ];
        setComments(defaultComments);
        localStorage.setItem("price_tracker_ar_community_comments", JSON.stringify(defaultComments));
      }
    } catch (err) {
      console.error("Error reading community comments:", err);
    }
  }, []);

  // Save comments to local storage
  const saveComments = (newComments: Comment[]) => {
    setComments(newComments);
    try {
      localStorage.setItem("price_tracker_ar_community_comments", JSON.stringify(newComments));
    } catch (err) {
      console.error("Error saving community comments:", err);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const authorName = newAuthor.trim() || "Anónimo";
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: authorName,
      text: newCommentText.trim(),
      timestamp: "Ahora mismo",
      storeTag: selectedStore === "General" ? undefined : selectedStore,
      promoTag: selectedPromo === "General" ? undefined : selectedPromo,
      likes: 0
    };

    const updated = [newCommentObj, ...comments];
    saveComments(updated);
    setNewAuthor("");
    setNewCommentText("");

    trackEvent("community_comment_added", {
      author: authorName,
      store_tag: selectedStore,
      promo_tag: selectedPromo,
      text_length: newCommentText.trim().length
    });
  };

  const handleLike = (id: string) => {
    if (likedIds.has(id)) return; // Only allow one like per session
    
    const likedComment = comments.find(c => c.id === id);

    const updated = comments.map((c) => {
      if (c.id === id) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    });
    saveComments(updated);
    
    const newLiked = new Set(likedIds);
    newLiked.add(id);
    setLikedIds(newLiked);

    trackEvent("community_comment_liked", {
      comment_id: id,
      author: likedComment ? likedComment.author : "unknown",
      store_tag: likedComment?.storeTag || "none",
      promo_tag: likedComment?.promoTag || "none"
    });
  };

  return (
    <div className="w-full flex flex-col gap-6" id="community-hub-section">
      
      {/* 1. Live Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active visitors widget */}
        <div className="bg-gradient-to-br from-[#0B1021] to-[#121A36] border border-indigo-950 rounded-2xl p-4 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/50 border border-emerald-500/35 p-3 rounded-xl shadow-inner text-emerald-400 relative">
              <Users className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest font-bold text-emerald-400 animate-pulse">
                🔴 EN VIVO • COMPARANDO
              </span>
              <span className="font-display font-black text-xl text-white tracking-tight animate-pulse flex items-center gap-1.5">
                {activeUsers.toLocaleString("es-AR")}
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-[ping_1.2s_infinite]" />
              </span>
              <span className="text-emerald-400 text-[10px] font-semibold block uppercase tracking-wide">
                usuarios activos ahora ⚡
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-sans font-bold text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-500/35 shadow-inner animate-pulse">
              Vivos AR
            </span>
          </div>
        </div>

        {/* Searches widget */}
        <div className="bg-gradient-to-br from-[#0B1021] to-[#121A36] border border-indigo-950 rounded-2xl p-4 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="bg-pink-950/50 border border-pink-500/35 p-3 rounded-xl shadow-inner text-pink-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Búsquedas Hoy
              </span>
              <span className="font-display font-black text-xl text-white tracking-tight">
                {searchesToday.toLocaleString("es-AR")}
              </span>
              <span className="text-pink-400 text-[10px] font-semibold block">
                precios rastreados 🔥
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-sans font-bold text-slate-400 bg-[#060810] px-2 py-1 rounded-lg border border-indigo-950 shadow-inner">
              Inflación-Free
            </span>
          </div>
        </div>

        {/* 2. Site Maintenance Donation Link Card - Steaming Coffee Cup style */}
        <div className="bg-gradient-to-br from-[#120B1A] via-[#1C122C] to-[#150F25] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all duration-300">
          <div className="absolute -bottom-3 -right-3 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            
            {/* Steaming Coffee Cup Icon Container */}
            <div className="bg-amber-950/60 border border-amber-500/35 p-3 rounded-xl shadow-inner relative flex items-center justify-center min-w-12 h-12 overflow-visible">
              
              {/* Steaming waves floating upwards */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5 justify-center w-6">
                <span className="w-[1.5px] h-3 bg-amber-400/60 rounded-full animate-[bounce_1.2s_infinite] opacity-80" />
                <span className="w-[1.5px] h-4 bg-amber-300/70 rounded-full animate-[bounce_1.4s_infinite_0.2s] opacity-90" />
                <span className="w-[1.5px] h-3 bg-amber-400/60 rounded-full animate-[bounce_1.2s_infinite_0.4s] opacity-80" />
              </div>
              
              <svg className="w-6 h-6 text-amber-400 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.5)] transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" x2="14" y1="2" y2="2" />
              </svg>
            </div>
            
            <div className="flex-1 pr-1">
              <span className="block text-[9px] uppercase tracking-widest font-extrabold text-amber-400">
                Apoyar Servidor AR
              </span>
              <h4 className="font-display font-black text-xs text-white leading-tight flex items-center gap-1">
                Cafecito Humeante
                <span className="animate-pulse">☕</span>
              </h4>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5 leading-tight">
                ¡Invitame un café para mantener el comparador en vivo y libre de publicidad!
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <a
              href="https://mpago.la/2m7bcUT"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              onClick={() => {
                trackEvent("cafecito_clicked", {
                  url: "https://mpago.la/2m7bcUT"
                });
              }}
              className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-display font-black text-[11px] px-3.5 py-2.5 rounded-xl shadow-md shadow-amber-950/50 hover:shadow-lg hover:scale-105 hover:from-amber-400 hover:to-amber-500 transition-all block text-center uppercase tracking-wider cursor-pointer"
            >
              Invitar Café ☕
            </a>
          </div>
        </div>
      </div>

      {/* 3. Collapsible Blog of Suggestions */}
      <div className="bg-[#0B1021]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
        
        {/* Toggle Header */}
        <button
          onClick={() => {
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);
            trackEvent("community_hub_toggled", {
              open: nextOpen
            });
          }}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-900/40 transition-colors text-left outline-hidden cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-tr from-pink-500 to-purple-600 text-white p-2.5 rounded-2xl shadow-xl shadow-purple-500/10 flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white tracking-tight flex items-center gap-2">
                Blog de Sugerencias y Datos de Góndola
                <span className="hidden sm:inline-block text-[10px] bg-pink-500/15 text-pink-400 border border-pink-500/35 px-2.5 py-0.5 rounded-full font-sans font-bold uppercase tracking-wider">
                  {comments.length} Tips
                </span>
              </h3>
              <p className="text-xs text-indigo-200/60 font-sans font-medium mt-0.5">
                Bargains, ofertas encontradas en supermercados y trucos de cuotas compartidos por visitantes.
              </p>
            </div>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 group-hover:text-white transition-colors">
            {isOpen ? <ChevronUp className="w-5 h-5 stroke-[2.5px]" /> : <ChevronDown className="w-5 h-5 stroke-[2.5px]" />}
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-slate-900/60"
            >
              <div className="p-6 space-y-6">
                
                {/* Submit New Suggestion form */}
                <form onSubmit={handleAddComment} className="bg-[#05070e]/80 border border-slate-800/70 p-5 rounded-2xl space-y-4 shadow-inner">
                  <div className="flex items-center gap-1.5 text-xs font-black text-pink-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Compartí tu Hallazgo en Góndola o Tarjeta</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Author input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-sans font-extrabold uppercase text-slate-400 tracking-wider">
                        Tu Nombre / Alias
                      </label>
                      <input
                        type="text"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="Ej. CompradorInteligente"
                        maxLength={25}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-pink-500/60 font-sans font-semibold placeholder:text-slate-600"
                      />
                    </div>

                    {/* Store tag dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-sans font-extrabold uppercase text-slate-400 tracking-wider">
                        Comercio / Tienda
                      </label>
                      <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-pink-500/60 font-sans font-bold"
                      >
                        <option value="General">General (Todo el País)</option>
                        <option value="Carrefour">Carrefour</option>
                        <option value="Coto">Coto Digital</option>
                        <option value="Día">Supermercados Día</option>
                        <option value="Jumbo">Jumbo</option>
                        <option value="Vea">Supermercados Vea</option>
                        <option value="Easy">Easy</option>
                        <option value="Mercado Libre">Mercado Libre</option>
                        <option value="Provincia Compras">Provincia Compras</option>
                        <option value="Tienda BNA">Tienda BNA</option>
                      </select>
                    </div>

                    {/* Promo tag dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-sans font-extrabold uppercase text-slate-400 tracking-wider">
                        Beneficio / Tarjeta
                      </label>
                      <select
                        value={selectedPromo}
                        onChange={(e) => setSelectedPromo(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-pink-500/60 font-sans font-bold"
                      >
                        <option value="General">General (Efectivo/Otro)</option>
                        <option value="Mercado Pago">Mercado Pago (Billetera)</option>
                        <option value="Naranja X">Naranja X (Plan Zeta)</option>
                        <option value="Tarjeta Carrefour">Tarjeta Carrefour</option>
                        <option value="Club Día">Club Día / Prepaga</option>
                        <option value="Tarjeta Cencosud">Tarjeta Cencosud</option>
                        <option value="Cuenta DNI">Cuenta DNI (Bco Prov)</option>
                        <option value="MODO / Galicia">MODO / Bcos Privados</option>
                        <option value="Banco Nación">BNA / Tienda BNA</option>
                      </select>
                    </div>
                  </div>

                  {/* Suggestion text */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-sans font-extrabold uppercase text-slate-400 tracking-wider">
                      Detalle de la oferta / tip de ahorro
                    </label>
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Ej. Encontré el puré de tomates Día 20% más barato llevando dos unidades y pagando con el saldo cargado en Mercado Pago..."
                      required
                      maxLength={300}
                      rows={2}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-pink-500/60 font-sans font-medium placeholder:text-slate-600 resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-sans font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/10 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      <span>Publicar sugerencia</span>
                      <Send className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>
                  </div>
                </form>

                {/* Suggestions Feed */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No hay sugerencias publicadas todavía. ¡Sé el primero en compartir!
                    </div>
                  ) : (
                    comments.map((comment) => {
                      const isLiked = likedIds.has(comment.id);
                      return (
                        <div
                          key={comment.id}
                          className="bg-[#111625]/60 border border-slate-800/60 rounded-2xl p-4.5 flex flex-col gap-2.5 hover:border-slate-700/60 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-xs text-slate-200">
                                @{comment.author}
                              </span>
                              <span className="text-[10px] text-slate-500 font-sans font-medium">
                                • {comment.timestamp}
                              </span>
                            </div>
                            
                            {/* Tags display */}
                            <div className="flex items-center gap-1.5">
                              {comment.storeTag && (
                                <span className="text-[9px] font-sans font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {comment.storeTag}
                                </span>
                              )}
                              {comment.promoTag && (
                                <span className="text-[9px] font-sans font-bold bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {comment.promoTag}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {comment.text}
                          </p>

                          <div className="flex justify-end border-t border-slate-900/40 pt-2 mt-1">
                            <button
                              onClick={() => handleLike(comment.id)}
                              className={`flex items-center gap-1 text-[11px] font-sans font-bold cursor-pointer transition-all ${
                                isLiked
                                  ? "text-pink-500"
                                  : "text-slate-500 hover:text-pink-400 hover:scale-105"
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-pink-500" : ""}`} />
                              <span>{comment.likes} {comment.likes === 1 ? "útil" : "útiles"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
