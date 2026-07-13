import * as React from "react";
import { motion } from "motion/react";
import { 
  ExternalLink, 
  ShoppingBag, 
  Zap, 
  TrendingUp, 
  Flame, 
  HelpCircle,
  Truck,
  Percent,
  Compass,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { trackEvent } from "../utils/mixpanel";

interface Store {
  name: string;
  url: string;
  color: string; // Tailwind border/text/glow classes
  bgGradient: string;
  iconBg: string;
  badge: string;
  description: string;
  logoInitial: string;
}

const STORES: Store[] = [
  {
    name: "COTO",
    url: "https://www.cotodigital3.com.ar",
    color: "from-yellow-500/20 to-amber-600/20 text-yellow-400 border-yellow-500/30 hover:border-yellow-400/80 shadow-yellow-500/5",
    bgGradient: "from-yellow-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-yellow-500/10 text-yellow-400",
    badge: "ENVÍOS PROPIOS",
    description: "Excelente variedad en carnes, frescos y ofertas exclusivas de fin de semana.",
    logoInitial: "Co"
  },
  {
    name: "CARREFOUR",
    url: "https://www.carrefour.com.ar",
    color: "from-blue-500/20 to-indigo-600/20 text-blue-400 border-blue-500/30 hover:border-blue-400/80 shadow-blue-500/5",
    bgGradient: "from-blue-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-blue-500/10 text-blue-400",
    badge: "MI CARREFOUR",
    description: "Descuentos del 10% al 15% con su tarjeta de fidelidad y app móvil.",
    logoInitial: "Ca"
  },
  {
    name: "DÍA",
    url: "https://diaonline.supermercadosdia.com.ar",
    color: "from-red-500/20 to-rose-600/20 text-red-400 border-red-500/30 hover:border-red-400/80 shadow-red-500/5",
    bgGradient: "from-red-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-red-500/10 text-red-400",
    badge: "CLUB DÍA",
    description: "Marca propia líder en relación precio-calidad. Cupones imperdibles.",
    logoInitial: "Dí"
  },
  {
    name: "JUMBO",
    url: "https://www.jumbo.com.ar",
    color: "from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-400/80 shadow-emerald-500/5",
    bgGradient: "from-emerald-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-emerald-500/10 text-emerald-400",
    badge: "PREMIUM",
    description: "Calidad de selección en importados, frescos y excelente atención premium.",
    logoInitial: "Ju"
  },
  {
    name: "VEA",
    url: "https://www.veasupermercados.com.ar",
    color: "from-amber-500/20 to-orange-600/20 text-amber-400 border-amber-500/30 hover:border-amber-400/80 shadow-amber-500/5",
    bgGradient: "from-amber-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-amber-500/10 text-amber-400",
    badge: "OFERTAS VEA",
    description: "Precios bajos todos los días en almacén, carnicería y verduras.",
    logoInitial: "Ve"
  },
  {
    name: "CHANGOMAS",
    url: "https://www.masonline.com.ar",
    color: "from-sky-400/20 to-blue-500/20 text-sky-300 border-sky-400/30 hover:border-sky-300/80 shadow-sky-400/5",
    bgGradient: "from-sky-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-sky-400/10 text-sky-300",
    badge: "SUPER PRECIOS",
    description: "Grandes ofertas por volumen, packs de ahorro familiar y electro.",
    logoInitial: "Ch"
  },
  {
    name: "FARMACITY",
    url: "https://www.farmacity.com.ar",
    color: "from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30 hover:border-cyan-400/80 shadow-cyan-500/5",
    bgGradient: "from-cyan-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-cyan-500/10 text-cyan-400",
    badge: "SALUD & BELLEZA",
    description: "Perfumería, cosmética, medicamentos y promos con tarjetas bancarias.",
    logoInitial: "Fa"
  },
  {
    name: "EASY",
    url: "https://www.easy.com.ar",
    color: "from-orange-500/20 to-red-600/20 text-orange-400 border-orange-500/30 hover:border-orange-400/80 shadow-orange-500/5",
    bgGradient: "from-orange-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-orange-500/10 text-orange-400",
    badge: "HOGAR & OBRA",
    description: "Herramientas, construcción, decoración y cuotas sin interés en deco.",
    logoInitial: "Ea"
  },
  {
    name: "PEDIDOSYA",
    url: "https://www.pedidosya.com.ar",
    color: "from-rose-500/20 to-pink-600/20 text-pink-400 border-rose-500/30 hover:border-rose-400/80 shadow-rose-500/5",
    bgGradient: "from-rose-950/20 via-slate-900/90 to-slate-950",
    iconBg: "bg-rose-500/10 text-pink-400",
    badge: "ENTREGA RAPIDA",
    description: "PedidosYa Market, restaurantes y farmacias con envíos en minutos.",
    logoInitial: "Py"
  },
  {
    name: "RAPPI",
    url: "https://www.rappi.com.ar",
    color: "from-[#FF441F]/20 to-[#FF441F]/40 text-[#FF441F] border-[#FF441F]/30 hover:border-[#FF441F]/80 shadow-[#FF441F]/5",
    bgGradient: "from-[#FF441F]/5 via-slate-900/90 to-slate-950",
    iconBg: "bg-[#FF441F]/10 text-[#FF441F]",
    badge: "TURBO 10MIN",
    description: "Envíos ultra veloces y suscripción Rappi Prime con envíos gratis.",
    logoInitial: "Ra"
  },
  {
    name: "MERCADO LIBRE",
    url: "https://listado.mercadolibre.com.ar/",
    color: "from-pink-500/20 to-purple-600/20 text-pink-300 border-pink-500/30 hover:border-pink-300/80 shadow-pink-500/5",
    bgGradient: "from-pink-950/10 via-slate-900/90 to-slate-950",
    iconBg: "bg-pink-500/10 text-pink-300",
    badge: "CUOTAS & ENVIOS",
    description: "Mayor catálogo de electrodomésticos, indumentaria y envíos Full.",
    logoInitial: "Ml"
  }
];

export default function StoreAccessGrid() {
  return (
    <div className="w-full bg-[#0D1121] rounded-3xl border-2 border-indigo-500/20 shadow-2xl p-6 sm:p-8" id="store-access-grid-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-950 pb-5 mb-6">
        <div>
          <h3 className="font-display font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-pink-500" />
            Acceso Directo a Tiendas Oficiales
          </h3>
          <p className="text-xs text-slate-400 font-sans font-medium mt-1">
            Navegá directamente a los portales oficiales de venta para comparar o realizar tu compra hoy.
          </p>
        </div>

        {/* Dynamic status badges */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            Vínculos Seguros
          </span>
          <span className="flex items-center gap-1 text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
            <Percent className="w-3.5 h-3.5" />
            11 Cadenas AR
          </span>
        </div>
      </div>

      {/* Bento Grid layout of Store Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STORES.map((store) => (
          <motion.a
            key={store.name}
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("store_link_clicked", { store: store.name, url: store.url })}
            whileHover={{ scale: 1.025, y: -4 }}
            whileTap={{ scale: 0.985 }}
            className={`block rounded-2xl border bg-gradient-to-br ${store.bgGradient} ${store.color} p-4.5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative group cursor-pointer`}
          >
            {/* Corner Decorative Arrow */}
            <div className="absolute top-4 right-4 text-slate-500 group-hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </div>

            <div className="flex items-start gap-3.5">
              {/* Brand Letter Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-sm uppercase shrink-0 shadow-inner ${store.iconBg}`}>
                {store.logoInitial}
              </div>

              {/* Title & Badge */}
              <div className="space-y-1">
                <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 group-hover:text-slate-300 transition-colors">
                  {store.badge}
                </span>
                <h4 className="font-display font-black text-base text-white tracking-tight flex items-center gap-1">
                  {store.name}
                </h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-3 group-hover:text-slate-300 transition-colors">
              {store.description}
            </p>

            {/* Glowing background hint on hover */}
            <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-40 transition-opacity" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}
