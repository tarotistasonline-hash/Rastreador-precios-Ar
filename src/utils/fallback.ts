import { SearchResult } from "../types";

export function getProductDetails(query: string) {
  const normalized = query.toLowerCase().trim();
  
  // 1. Detailed custom keyword checks
  if (
    normalized.includes("yogur") ||
    normalized.includes("yogurt") ||
    normalized.includes("ser+pro") ||
    normalized.includes("ser pro") ||
    normalized.includes("ser protein") ||
    normalized.includes("ser colageno") ||
    normalized.includes("ser colágeno")
  ) {
    return {
      productName: "Yogur Ser Protein con Colágeno y Proteínas 160g",
      basePrice: 2350,
      category: "groceries" as const
    };
  }

  if (normalized.includes("yerba") || normalized.includes("playadito")) {
    return {
      productName: "Yerba Mate Playadito con Palo 1kg",
      basePrice: 4150,
      category: "groceries" as const
    };
  }

  if (normalized.includes("tv") || normalized.includes("televisor") || normalized.includes("smart")) {
    return {
      productName: "Smart TV 50\" 4K UHD",
      basePrice: 459999,
      category: "electronics" as const
    };
  }

  if (normalized.includes("cafe") || normalized.includes("café") || normalized.includes("cabrales")) {
    return {
      productName: "Café Cabrales Molido Especial 500g",
      basePrice: 6490,
      category: "groceries" as const
    };
  }

  if (normalized.includes("celular") || normalized.includes("motorola") || normalized.includes("samsung") || normalized.includes("telefono") || normalized.includes("teléfono")) {
    return {
      productName: "Celular Motorola Edge / Samsung Galaxy",
      basePrice: 319999,
      category: "electronics" as const
    };
  }

  if (normalized.includes("zapatilla") || normalized.includes("zapatillas") || normalized.includes("running")) {
    return {
      productName: "Zapatillas Running Deportivas",
      basePrice: 84900,
      category: "footwear" as const
    };
  }

  if (normalized.includes("estufa") || normalized.includes("cuarzo") || normalized.includes("magiclick") || normalized.includes("maquiclick") || normalized.includes("vela")) {
    return {
      productName: "Estufa de Cuarzo Magiclick de 2 Velas",
      basePrice: 22499,
      category: "electronics" as const
    };
  }

  // 2. Generic classifier based on words
  const groceryKeywords = [
    "leche", "queso", "manteca", "fideos", "tallarines", "arroz", "gaseosa", "coca", "cerveza", "pan", "galletita", "galletitas", "mermelada", "aceite", "azucar", "azúcar", "harina", "detergente", "shampoo", "jabon", "jabón", "dentifrico", "dentífrico", "crema", "dulce", "agua", "jugo", "soda", "postre", "flan", "pure", "puré", "tomate", "polenta", "atun", "atún", "arveja", "choclo", "mostaza", "mayonesa", "ketchup", "salsa", "limpiador", "lavandina", "papel", "servilleta", "esponja", "carne", "fresco",
    "farmacia", "remedio", "paracetamol", "ibuprofeno", "aspirina", "desodorante", "preservativos", "pañales", "suplemento", "perfume", "protector solar", "maquillaje", "rimel", "labial", "esmalte"
  ];
  const isGrocery = groceryKeywords.some(kw => normalized.includes(kw));

  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash += query.charCodeAt(i);
  }

  if (isGrocery) {
    const calculatedPrice = 1200 + (hash % 20) * 350; // $1.200 to $7.850 pesos
    return {
      productName: query,
      basePrice: calculatedPrice,
      category: "groceries" as const
    };
  }

  // General fallback estimation based on hash
  const calculatedPrice = 1500 + (hash % 90) * 800; // $1.500 to $73.500 pesos
  if (calculatedPrice < 15000) {
    return {
      productName: query,
      basePrice: calculatedPrice,
      category: "groceries" as const
    };
  } else if (calculatedPrice < 50000) {
    return {
      productName: query,
      basePrice: calculatedPrice,
      category: "general" as const
    };
  } else {
    return {
      productName: query,
      basePrice: calculatedPrice,
      category: "electronics" as const
    };
  }
}

export function generateClientFallback(query: string): SearchResult {
  const details = getProductDetails(query);
  const { productName, basePrice, category } = details;

  let storeTemplates: Array<{
    shopName: string;
    priceMultiplier: number;
    discounts: string;
    isBestDeal: boolean;
    urlTemplate: (q: string) => string;
  }> = [];

  if (category === "groceries") {
    storeTemplates = [
      {
        shopName: "Carrefour",
        priceMultiplier: 1.0, // Best deal base
        discounts: "15% de descuento los martes y miércoles con Tarjeta Carrefour (Crédito o Prepaga), o 10% con Mi Carrefour. Los lunes obtenés 10% de reintegro pagando con dinero en cuenta de Mercado Pago.",
        isBestDeal: true,
        urlTemplate: (q: string) => `https://www.carrefour.com.ar/catalogsearch/result/?q=${encodeURIComponent(q)}`
      },
      {
        shopName: "Coto Digital",
        priceMultiplier: 1.04,
        discounts: "10% de descuento de lunes a jueves con Comunidad Coto. Los viernes obtenés 20% de reintegro con tarjeta de débito Naranja X, o 3 cuotas sin interés (Plan Zeta) con tarjeta de crédito Naranja X.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.cotodigital3.com.ar/sitios/cdigi/browse?_dyncharset=utf-8&search=+${encodeURIComponent(q)}`
      },
      {
        shopName: "Farmacity",
        priceMultiplier: 1.02,
        discounts: "20% de descuento los lunes para socios de Club Farmacity en medicamentos seleccionados. Los jueves obtenés hasta 2x1 o 50% en la segunda unidad en marcas de cosmética y cuidado personal. 10% con Mercado Pago.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.farmacity.com.ar/busqueda?ft=${encodeURIComponent(q)}`
      },
      {
        shopName: "ChangoMas",
        priceMultiplier: 0.98,
        discounts: "Beneficios de Club ChangoMas. 15% de descuento los martes con Tarjeta Naranja X. Promociones semanales imperdibles en productos de almacén y perfumería.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.masonline.com.ar/busqueda?ft=${encodeURIComponent(q)}`
      },
      {
        shopName: "Supermercados Día",
        priceMultiplier: 0.95,
        discounts: "Precios exclusivos Club Día. Los miércoles tenés 15% de descuento pagando con Tarjeta Prepaga Día, y 10% de reintegro pagando con dinero en cuenta de Mercado Pago.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://diaonline.supermercadosdia.com.ar/busqueda?ft=${encodeURIComponent(q)}`
      },
      {
        shopName: "Jumbo",
        priceMultiplier: 1.10,
        discounts: "20% de descuento los miércoles con Tarjeta Cencosud (Crédito/Prepaga). 10% de descuento lunes y jueves abonando con tarjeta Naranja X.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.jumbo.com.ar/busqueda?ft=${encodeURIComponent(q)}`
      }
    ];
  } else if (category === "electronics") {
    storeTemplates = [
      {
        shopName: "Mercado Libre",
        priceMultiplier: 1.0, // Best deal
        discounts: "Hasta 10% OFF pagando con saldo en Mercado Pago. 3 cuotas sin interés con Tarjeta Mercado Pago, o 3 cuotas sin interés (Plan Zeta) con Tarjeta Naranja X.",
        isBestDeal: true,
        urlTemplate: (q: string) => `https://listado.mercadolibre.com.ar/${encodeURIComponent(q)}`
      },
      {
        shopName: "Provincia Compras",
        priceMultiplier: 1.03,
        discounts: "¡Hasta 9 cuotas sin interés pagando con tarjetas de crédito de Banco Provincia! O 30% de ahorro con Cuenta DNI prepaga los fines de semana.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.provinciacompras.com.ar/${encodeURIComponent(q)}`
      },
      {
        shopName: "Easy",
        priceMultiplier: 1.06,
        discounts: "15% de descuento los lunes y martes con tarjeta Cencosud. Envío gratis y 3 cuotas sin interés con tarjeta prepaga/crédito Mercado Pago, o Plan Zeta (3 cuotas cero interés) de Naranja X.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.easy.com.ar/search?w=${encodeURIComponent(q)}`
      },
      {
        shopName: "Carrefour Electro",
        priceMultiplier: 1.08,
        discounts: "Hasta 6 cuotas sin interés con Tarjeta Carrefour de Crédito en tecnología, o 10% de ahorro directo abonando en un pago con Mercado Pago.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.carrefour.com.ar/catalogsearch/result/?q=${encodeURIComponent(q)}`
      }
    ];
  } else {
    // General or footwear
    storeTemplates = [
      {
        shopName: "Mercado Libre",
        priceMultiplier: 1.0, // Best deal
        discounts: "Envíos gratis en miles de productos seleccionados. 3 cuotas sin interés con tarjeta Mercado Pago o Plan Zeta con Naranja X.",
        isBestDeal: true,
        urlTemplate: (q: string) => `https://listado.mercadolibre.com.ar/${encodeURIComponent(q)}`
      },
      {
        shopName: "Farmacity",
        priceMultiplier: 1.03,
        discounts: "Hasta 3 cuotas sin interés con tarjetas bancarias seleccionadas. Descuentos imperdibles en perfumería e higiene personal con Club Farmacity.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.farmacity.com.ar/busqueda?ft=${encodeURIComponent(q)}`
      },
      {
        shopName: "Easy",
        priceMultiplier: 1.05,
        discounts: "10% de ahorro los miércoles con Tarjeta Cencosud. 3 cuotas fijas con tarjeta Mercado Pago o Plan Zeta con Naranja X.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.easy.com.ar/search?w=${encodeURIComponent(q)}`
      },
      {
        shopName: "Provincia Compras",
        priceMultiplier: 1.04,
        discounts: "Hasta 6 cuotas sin interés con tarjetas de crédito de Banco Provincia. Beneficios exclusivos Cuenta DNI.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.provinciacompras.com.ar/${encodeURIComponent(q)}`
      },
      {
        shopName: "Carrefour",
        priceMultiplier: 1.09,
        discounts: "15% de descuento pagando con Tarjeta Carrefour (Crédito o Prepaga). 10% de reintegro con Mercado Pago dinero en cuenta.",
        isBestDeal: false,
        urlTemplate: (q: string) => `https://www.carrefour.com.ar/catalogsearch/result/?q=${encodeURIComponent(q)}`
      }
    ];
  }

  const offers = storeTemplates.map(store => {
    const rawPrice = Math.round(basePrice * store.priceMultiplier);
    const formattedPrice = `$ ${rawPrice.toLocaleString("es-AR")}`;
    const cuota3 = Math.round(rawPrice / 3);
    const cuota6WithInterest = Math.round((rawPrice * 1.25) / 6);
    
    let paymentComparison = "";
    if (store.shopName === "Provincia Compras") {
      paymentComparison = `Esta oferta destaca por su financiamiento bancario: podés comprar en hasta 9 cuotas sin interés de $ ${(Math.round(rawPrice / 9)).toLocaleString("es-AR")} por mes, licuando completamente el costo frente a la inflación mensual proyectada de Argentina.`;
    } else if (category === "groceries") {
      paymentComparison = `Al ser un producto comestible/almacén de supermercado, conviene pagarlo en 1 pago con débito, efectivo o dinero en cuenta para aprovechar los descuentos inmediatos (como el 15% de Tarjeta Carrefour o Comunidad Coto).`;
    } else {
      paymentComparison = `En 1 pago o débito conviene si tenés el efectivo disponible. En 3 cuotas sin interés de $ ${cuota3.toLocaleString("es-AR")} o en 6 cuotas fijas de $ ${cuota6WithInterest.toLocaleString("es-AR")} mensuales con interés del 25% CFT, lo cual puede ser conveniente si la inflación se mantiene sobre el 3.5% mensual.`;
    }

    return {
      shopName: store.shopName,
      price: rawPrice,
      formattedPrice,
      paymentComparison,
      discounts: store.discounts,
      purchaseUrl: getCleanSearchUrl(store.shopName, query),
      isBestDeal: store.isBestDeal
    };
  });

  let bestShop = offers.find(o => o.isBestDeal)?.shopName || offers[0].shopName;
  let bestPriceFormatted = offers.find(o => o.isBestDeal)?.formattedPrice || offers[0].formattedPrice;

  let summary = "";
  if (category === "groceries") {
    summary = `Para la búsqueda de "${productName}", el mejor precio de referencia estimado se encuentra en ${bestShop} por ${bestPriceFormatted}. Para productos de supermercado e individuales, se recomienda comparar directamente entre las cadenas físicas y digitales líderes como Carrefour, Coto o Día, aprovechando los descuentos de días específicos de sus tarjetas de fidelidad (como Comunidad Coto o Mi Carrefour) y billeteras virtuales de alta adopción como Cuenta DNI o MODO.`;
  } else {
    summary = `Para la búsqueda de "${productName}", hoy el mejor precio de referencia estimado lo encontramos en ${bestShop} por ${bestPriceFormatted}. Con una inflación estimada del 3% al 4% mensual en Argentina, las compras de bienes durables en cuotas siguen siendo una excelente opción siempre que el recargo (CFT) sea menor a la inflación acumulada. Se recomienda aprovechar los descuentos bancarios especiales o cuotas sin interés de Provincia Compras si contás con sus tarjetas de crédito.`;
  }

  const citations = category === "groceries" 
    ? [
        { title: "Búsqueda directa en Carrefour Argentina", uri: `https://www.carrefour.com.ar/catalogsearch/result/?q=${encodeURIComponent(query)}` },
        { title: "Búsqueda directa en Coto Digital", uri: `https://www.cotodigital3.com.ar/sitios/cdigi/browse?_dyncharset=utf-8&search=+${encodeURIComponent(query)}` }
      ]
    : [
        { title: "Búsqueda directa en Mercado Libre Argentina", uri: `https://listado.mercadolibre.com.ar/${encodeURIComponent(query)}` },
        { title: "Búsqueda directa en Carrefour Argentina", uri: `https://www.carrefour.com.ar/catalogsearch/result/?q=${encodeURIComponent(query)}` }
      ];

  return {
    productName,
    summary,
    offers,
    isFallback: true,
    citations
  };
}

function getCleanSearchUrl(shopName: string, query: string): string {
  let normalizedQuery = query.toLowerCase().trim();
  
  // Clean special characters like "+" or redundant symbols that break e-commerce search engines
  normalizedQuery = normalizedQuery.replace(/\+/g, " ").replace(/\s+/g, " ").trim();
  
  // If searching for ser pro / ser protein / ser colageno
  if (
    normalizedQuery.includes("ser pro") || 
    normalizedQuery.includes("ser+pro") || 
    normalizedQuery.includes("ser protein") || 
    normalizedQuery.includes("ser colageno") ||
    (normalizedQuery.includes("ser") && normalizedQuery.includes("yogur"))
  ) {
    normalizedQuery = "yogur ser protein"; // extremely robust on Coto, Dia, Carrefour
  }
  
  // Remove accents
  normalizedQuery = normalizedQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const shop = shopName.toLowerCase();
  const isSupermarket = shop.includes("carrefour") || shop.includes("coto") || shop.includes("dia") || shop.includes("día") || shop.includes("jumbo") || shop.includes("vea") || shop.includes("easy") || shop.includes("farmacity") || shop.includes("changomas") || shop.includes("masonline");
  
  if (isSupermarket) {
    // Remove common stop words and prepositions in Spanish that break simple database searches
    const stopWords = ["con", "de", "para", "la", "el", "los", "las", "un", "una", "y", "en", "al"];
    let words = normalizedQuery.split(/\s+/);
    
    // Also remove words shorter than 3 characters, except for well-known brands/classes
    words = words.filter(word => {
      if (stopWords.includes(word)) return false;
      if (word === "pro") return false; // strip "pro" which causes failure on Dia/Coto
      return true;
    });
    
    // If they searched for a long product name, keep only the first 2-3 significant words for the search URL
    if (words.length > 3) {
      words = words.slice(0, 3);
    }
    
    normalizedQuery = words.join(" ");
  }

  const q = encodeURIComponent(normalizedQuery);
  
  if (shop.includes("carrefour")) {
    return `https://www.carrefour.com.ar/catalogsearch/result/?q=${q}`;
  }
  if (shop.includes("coto")) {
    return `https://www.cotodigital3.com.ar/sitios/cdigi/browse?_dyncharset=utf-8&search=+${q}`;
  }
  if (shop.includes("día") || shop.includes("dia")) {
    return `https://diaonline.supermercadosdia.com.ar/busqueda?ft=${q}`;
  }
  if (shop.includes("farmacity")) {
    return `https://www.farmacity.com.ar/busqueda?ft=${q}`;
  }
  if (shop.includes("changomas") || shop.includes("masonline")) {
    return `https://www.masonline.com.ar/busqueda?ft=${q}`;
  }
  if (shop.includes("jumbo")) {
    return `https://www.jumbo.com.ar/busqueda?ft=${q}`;
  }
  if (shop.includes("vea")) {
    return `https://www.veasupermercados.com.ar/busqueda?ft=${q}`;
  }
  if (shop.includes("easy")) {
    return `https://www.easy.com.ar/search?w=${q}`;
  }
  if (shop.includes("libre")) {
    return `https://listado.mercadolibre.com.ar/${q}`;
  }
  if (shop.includes("provincia")) {
    return `https://www.provinciacompras.com.ar/${q}`;
  }
  if (shop.includes("bna") || shop.includes("nacion") || shop.includes("nación")) {
    return `https://www.tiendabna.com.ar/catalogsearch/result/?q=${q}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(shopName + " " + normalizedQuery)}`;
}

