import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import SearchBox from "./components/SearchBox";
import OfferCard from "./components/OfferCard";
import SearchHistory from "./components/SearchHistory";
import AnalysisSummary from "./components/AnalysisSummary";
import CommunityHub from "./components/CommunityHub";
import AdSenseBanner from "./components/AdSenseBanner";
import CreatePriceAlert from "./components/CreatePriceAlert";
import PriceAlertsManager from "./components/PriceAlertsManager";
import ComparisonTable from "./components/ComparisonTable";
import EmailNotificationSettings from "./components/EmailNotificationSettings";
import IpcCalculator from "./components/IpcCalculator";
import PotentialSavings from "./components/PotentialSavings";
import { SearchResult, HistoryItem, PriceAlert, Offer } from "./types";
import { generateClientFallback } from "./utils/fallback";
import { Sparkles, HelpCircle, AlertCircle, ShoppingCart, Bell, TrendingDown, X, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initMixpanel, trackEvent } from "./utils/mixpanel";

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchedTerm, setSearchedTerm] = useState<string>("");
  const [visitorCount, setVisitorCount] = useState(15420);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isRefreshingAlerts, setIsRefreshingAlerts] = useState(false);
  const [triggeredAlertNotification, setTriggeredAlertNotification] = useState<PriceAlert | null>(null);
  const [comparedOffers, setComparedOffers] = useState<Offer[]>([]);
  const [comparisonWarning, setComparisonWarning] = useState<string | null>(null);
  const [notificationEmail, setNotificationEmail] = useState<string>("");
  const [extremeSavingsMode, setExtremeSavingsMode] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Initialize Mixpanel and track session launch
  useEffect(() => {
    initMixpanel();
    trackEvent("session_start", {
      app_name: "Rastreo de Precios AR"
    });
  }, []);

  // Track Extreme Savings Mode changes
  const isFirstExtremeSavingsRender = useRef(true);
  useEffect(() => {
    if (isFirstExtremeSavingsRender.current) {
      isFirstExtremeSavingsRender.current = false;
      return;
    }
    trackEvent("extreme_savings_toggled", {
      enabled: extremeSavingsMode,
      searched_term: searchedTerm
    });
  }, [extremeSavingsMode]);

  // Load email from LocalStorage
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem("price_tracker_ar_email");
      if (storedEmail) {
        setNotificationEmail(storedEmail);
      }
    } catch (err) {
      console.error("Error loading notification email:", err);
    }
  }, []);

  const handleSaveEmail = (email: string) => {
    setNotificationEmail(email);
    localStorage.setItem("price_tracker_ar_email", email);
    trackEvent("notification_email_updated", { has_email: true });
  };

  const handleClearEmail = () => {
    setNotificationEmail("");
    localStorage.removeItem("price_tracker_ar_email");
    trackEvent("notification_email_updated", { has_email: false });
  };

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

  // Load price alerts from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("price_tracker_ar_alerts");
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading price alerts:", err);
    }
  }, []);

  // Save alerts to state and LocalStorage
  const saveAlerts = (newAlerts: PriceAlert[]) => {
    try {
      setAlerts(newAlerts);
      localStorage.setItem("price_tracker_ar_alerts", JSON.stringify(newAlerts));
    } catch (err) {
      console.error("Error saving price alerts:", err);
    }
  };

  // Helper to search a single product's lowest price for alert refreshing
  const checkSingleAlert = async (query: string): Promise<{ lowestPrice: number; storeName: string } | null> => {
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      let data: SearchResult;
      if (!res.ok) {
        data = generateClientFallback(query);
      } else {
        data = await res.json();
      }

      if (data && data.offers && data.offers.length > 0) {
        const lowestOffer = data.offers.reduce((min, o) => {
          if (o.price && (!min.price || o.price < min.price)) {
            return o;
          }
          return min;
        }, data.offers[0]);
        return {
          lowestPrice: lowestOffer.price || 0,
          storeName: lowestOffer.shopName
        };
      }
      return null;
    } catch (err) {
      console.error("Error checking single alert:", err);
      try {
        const data = generateClientFallback(query);
        if (data && data.offers && data.offers.length > 0) {
          const lowestOffer = data.offers.reduce((min, o) => {
            if (o.price && (!min.price || o.price < min.price)) {
              return o;
            }
            return min;
          }, data.offers[0]);
          return {
            lowestPrice: lowestOffer.price || 0,
            storeName: lowestOffer.shopName
          };
        }
      } catch (inner) {}
      return null;
    }
  };

  // Check and trigger alerts based on a search result
  const checkAndTriggerAlertsForSearch = (searchResult: SearchResult, currentAlerts: PriceAlert[]) => {
    if (!searchResult || !searchResult.offers || searchResult.offers.length === 0) return;

    const lowestOffer = searchResult.offers.reduce((min, o) => {
      if (o.price && (!min.price || o.price < min.price)) {
        return o;
      }
      return min;
    }, searchResult.offers[0]);

    const lowestPrice = lowestOffer.price || 0;
    const storeName = lowestOffer.shopName;

    let updated = false;
    let newlyTriggered: PriceAlert | null = null;

    const newAlerts = currentAlerts.map((alert) => {
      const matches = 
        alert.productName.toLowerCase() === searchResult.productName.toLowerCase() ||
        searchResult.productName.toLowerCase().includes(alert.productName.toLowerCase()) ||
        alert.productName.toLowerCase().includes(searchResult.productName.toLowerCase());

      if (matches) {
        const wasTriggered = alert.isTriggered;
        const isNowTriggered = lowestPrice <= alert.targetPrice;
        
        updated = true;

        const updatedAlert = {
          ...alert,
          currentLowestPrice: lowestPrice,
          storeName: storeName,
          isTriggered: isNowTriggered,
          triggeredAt: isNowTriggered && !wasTriggered ? new Date().toLocaleDateString("es-AR") : alert.triggeredAt,
          isRead: isNowTriggered && !wasTriggered ? false : alert.isRead,
        };

        if (isNowTriggered && !wasTriggered) {
          newlyTriggered = updatedAlert;
        }

        return updatedAlert;
      }
      return alert;
    });

    if (updated) {
      saveAlerts(newAlerts);
      if (newlyTriggered) {
        setTriggeredAlertNotification(newlyTriggered);
        if (notificationEmail) {
          fetch("/api/alerts/notify-alert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: notificationEmail, alert: newlyTriggered }),
          }).catch((err) => console.error("Error dispatching search-triggered email notification:", err));
        }
      }
    }
  };

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
    setComparedOffers([]);
    setComparisonWarning(null);
    setIsOfflineMode(false);

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
      checkAndTriggerAlertsForSearch(data, alerts);
      setIsOfflineMode(false);
      trackEvent("search_performed", {
        query,
        is_fallback: false,
        offers_count: data.offers?.length || 0,
        lowest_price: data.offers && data.offers.length > 0 ? Math.min(...data.offers.map(o => o.price || 0)) : 0
      });
    } catch (err: any) {
      console.error("Error during search:", err);
      setIsOfflineMode(true);
      try {
        // Fallback to client-side database estimates immediately
        const fallbackData = generateClientFallback(query);
        setResult(fallbackData);
        saveToHistory(query);
        checkAndTriggerAlertsForSearch(fallbackData, alerts);
        // Set a mild info notice, but since results are loaded, we don't display it as a blocking error
        console.log("Client-side fallback generated successfully.");
        trackEvent("search_performed", {
          query,
          is_fallback: true,
          fallback_reason: err.message || "Network error",
          offers_count: fallbackData.offers?.length || 0,
          lowest_price: fallbackData.offers && fallbackData.offers.length > 0 ? Math.min(...fallbackData.offers.map(o => o.price || 0)) : 0
        });
      } catch (fallbackErr) {
        setError(err.message || "No se pudo conectar con el servicio de rastreo.");
        trackEvent("search_failed", {
          query,
          error_message: err.message || "No se pudo conectar con el servicio de rastreo."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOfferPrice = (shopName: string, newPrice: number) => {
    if (!result) return;
    const originalOffer = result.offers.find((o) => o.shopName === shopName);
    const oldPrice = originalOffer ? originalOffer.price : undefined;

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

    trackEvent("price_updated_by_user", {
      product_name: result.productName,
      shop_name: shopName,
      old_price: oldPrice,
      new_price: newPrice,
      price_difference: oldPrice !== undefined ? newPrice - oldPrice : 0
    });
  };

  const handleCreateAlert = (targetPrice: number) => {
    if (!result || !result.offers || result.offers.length === 0) return;

    const lowestOffer = result.offers.reduce((min, o) => {
      if (o.price && (!min.price || o.price < min.price)) {
        return o;
      }
      return min;
    }, result.offers[0]);

    const lowestPrice = lowestOffer.price || 0;
    const storeName = lowestOffer.shopName;

    const filtered = alerts.filter(
      (alert) => alert.productName.toLowerCase() !== result.productName.toLowerCase()
    );

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      productName: result.productName,
      targetPrice,
      initialPrice: lowestPrice,
      currentLowestPrice: lowestPrice,
      storeName,
      createdAt: new Date().toLocaleDateString("es-AR"),
      isTriggered: lowestPrice <= targetPrice,
      triggeredAt: lowestPrice <= targetPrice ? new Date().toLocaleDateString("es-AR") : undefined,
      isRead: false,
    };

    const newAlerts = [newAlert, ...filtered];
    saveAlerts(newAlerts);

    trackEvent("price_alert_created", {
      product_name: newAlert.productName,
      target_price: newAlert.targetPrice,
      initial_price: newAlert.initialPrice,
      is_triggered_immediately: newAlert.isTriggered,
      store_name: newAlert.storeName
    });

    if (newAlert.isTriggered) {
      setTriggeredAlertNotification(newAlert);
      if (notificationEmail) {
        fetch("/api/alerts/notify-alert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: notificationEmail, alert: newAlert }),
        }).catch((err) => console.error("Error dispatching immediately-triggered email notification:", err));
      }
    }
  };

  const handleDeleteAlert = (id: string) => {
    const deletedAlert = alerts.find((alert) => alert.id === id);
    const updated = alerts.filter((alert) => alert.id !== id);
    saveAlerts(updated);

    trackEvent("price_alert_deleted", {
      product_name: deletedAlert ? deletedAlert.productName : "unknown",
      target_price: deletedAlert ? deletedAlert.targetPrice : 0
    });
  };

  const handleMarkAsRead = (id: string) => {
    const updated = alerts.map((alert) => {
      if (alert.id === id) {
        return { ...alert, isRead: true };
      }
      return alert;
    });
    saveAlerts(updated);
  };

  const handleRefreshAlerts = async () => {
    if (alerts.length === 0) return;
    setIsRefreshingAlerts(true);
    
    const updatedAlerts = [...alerts];
    let triggeredAny = false;
    let newlyTriggered: PriceAlert | null = null;

    try {
      for (let i = 0; i < updatedAlerts.length; i++) {
        const alert = updatedAlerts[i];
        const query = alert.productName;
        
        const resultData = await checkSingleAlert(query);
        if (resultData) {
          const { lowestPrice, storeName } = resultData;
          const wasTriggered = alert.isTriggered;
          const isNowTriggered = lowestPrice <= alert.targetPrice;
          
          updatedAlerts[i] = {
            ...alert,
            currentLowestPrice: lowestPrice,
            storeName: storeName,
            isTriggered: isNowTriggered,
            triggeredAt: isNowTriggered && !wasTriggered ? new Date().toLocaleDateString("es-AR") : alert.triggeredAt,
            isRead: isNowTriggered && !wasTriggered ? false : alert.isRead,
          };

          if (isNowTriggered && !wasTriggered) {
            triggeredAny = true;
            newlyTriggered = updatedAlerts[i];
          }
        }
        
        await new Promise((r) => setTimeout(r, 400));
      }

      saveAlerts(updatedAlerts);

      if (triggeredAny && newlyTriggered) {
        setTriggeredAlertNotification(newlyTriggered);
        if (notificationEmail) {
          fetch("/api/alerts/notify-alert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: notificationEmail, alert: newlyTriggered }),
          }).catch((err) => console.error("Error dispatching refreshed email notification:", err));
        }
      }
    } catch (err) {
      console.error("Error refreshing alerts:", err);
    } finally {
      setIsRefreshingAlerts(false);
    }
  };

  const handleToggleCompare = (offer: Offer) => {
    setComparisonWarning(null);
    const exists = comparedOffers.some((o) => o.shopName === offer.shopName);
    
    trackEvent("compare_offer_toggled", {
      shop_name: offer.shopName,
      price: offer.price,
      is_added: !exists,
      product_name: result?.productName || searchedTerm
    });

    if (exists) {
      setComparedOffers(comparedOffers.filter((o) => o.shopName !== offer.shopName));
    } else {
      if (comparedOffers.length >= 3) {
        setComparisonWarning("¡Solo podés comparar hasta 3 productos al mismo tiempo!");
        setTimeout(() => setComparisonWarning(null), 5000);
        return;
      }
      setComparedOffers([...comparedOffers, offer]);
    }
  };

  const handleRemoveComparedOffer = (shopName: string) => {
    const removedOffer = comparedOffers.find((o) => o.shopName === shopName);
    trackEvent("compare_offer_toggled", {
      shop_name: shopName,
      price: removedOffer ? removedOffer.price : undefined,
      is_added: false,
      product_name: result?.productName || searchedTerm,
      method: "remove_button"
    });

    setComparedOffers(comparedOffers.filter((o) => o.shopName !== shopName));
    setComparisonWarning(null);
  };

  const handleClearComparison = () => {
    trackEvent("compare_cleared", {
      compared_count: comparedOffers.length
    });

    setComparedOffers([]);
    setComparisonWarning(null);
  };

  const isExtremeSavingsEligible = (offer: Offer) => {
    const text = `${offer.discounts || ""} ${offer.paymentComparison || ""}`.toLowerCase();
    const hasCuotas = (
      text.includes("sin interés") ||
      text.includes("sin interes") ||
      text.includes("cero interés") ||
      text.includes("cero interes") ||
      text.includes("cuotas sin")
    );
    
    const storeLower = offer.shopName.toLowerCase();
    const hasDniOrBna = ["coto", "carrefour", "jumbo", "dia", "día", "vea", "changomas", "masonline", "provincia compras"].some(s => storeLower.includes(s));
    
    const hasBankDiscount = (
      hasDniOrBna ||
      text.includes("cuenta dni") ||
      text.includes("modo") ||
      text.includes("bna") ||
      text.includes("nación") ||
      text.includes("nacion") ||
      text.includes("banco") ||
      text.includes("provincia") ||
      text.includes("naranja") ||
      text.includes("cencosud") ||
      text.includes("carrefour") ||
      text.includes("club día") ||
      text.includes("club dia") ||
      text.includes("comunidad coto") ||
      text.includes("reintegro") ||
      text.includes("ahorro") ||
      text.includes("descuento") ||
      text.includes("club farmacity")
    );
    return hasCuotas || hasBankDiscount;
  };

  const displayedOffers = result?.offers 
    ? (extremeSavingsMode ? result.offers.filter(isExtremeSavingsEligible) : result.offers)
    : [];

  return (
    <div className="min-h-screen bg-[#070913] relative overflow-hidden flex flex-col font-sans selection:bg-pink-500 selection:text-white text-slate-100">
      
      {/* Lively Neon Background Ambient Blobs */}
      <div className="absolute top-[-10%] left-[5%] w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute top-[25%] right-[-5%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Header extremeSavingsMode={extremeSavingsMode} onToggleExtremeSavings={setExtremeSavingsMode} />

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

        {/* Private Price Alerts & Notifications Suite */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PriceAlertsManager
              alerts={alerts}
              onDeleteAlert={handleDeleteAlert}
              onRefreshAlerts={handleRefreshAlerts}
              isRefreshing={isRefreshingAlerts}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
          <div className="lg:col-span-1">
            <EmailNotificationSettings
              onSaveEmail={handleSaveEmail}
              savedEmail={notificationEmail}
              onClearEmail={handleClearEmail}
              activeAlertsCount={alerts.filter(a => !a.isTriggered).length}
            />
          </div>
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
            
            {isOfflineMode ? (
              <div className="w-full max-w-4xl mx-auto bg-orange-950/25 border-2 border-orange-500/35 rounded-3xl p-6 shadow-xl shadow-orange-950/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shrink-0 shadow-lg shadow-orange-500/20 flex items-center justify-center animate-pulse">
                      <WifiOff className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping inline-block" />
                        Modo Offline / Servidor Alternativo Activo
                      </span>
                      <h3 className="font-display font-black text-white text-lg tracking-tight">
                        La API principal no respondió, ¡pero el rastreador local está en marcha!
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-medium">
                        Hemos activado la contingencia de estimaciones locales en tiempo real para evitar que te quedes sin comparar precios. Seguí estos pasos recomendados para aprovechar al máximo la búsqueda local:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-950/60 p-4.5 rounded-2xl border border-indigo-950/40">
                    <div className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-300 font-display font-black text-xs">
                        1
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">Usá palabras clave populares</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          Nuestra base local tiene excelentes estimaciones para: <strong className="text-orange-300">leche, fideos, yerba, café, aceite</strong> y productos de almacén cotidianos.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-300 font-display font-black text-xs">
                        2
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">Editá precios a tu medida</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          ¿Viste un precio distinto en tu sucursal? Usá el ícono de lápiz (<strong className="text-orange-300">✏️</strong>) en cada tarjeta para corregirlo y actualizar las cuotas al instante.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-300 font-display font-black text-xs">
                        3
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">Compará y descarga reportes</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          Seleccioná múltiples tiendas para armar tu tabla comparativa y pulsa el botón <strong className="text-orange-300">Descargar CSV</strong> para Excel.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-300 font-display font-black text-xs">
                        4
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">Reintentá cuando tengas señal</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          Podés forzar una nueva conexión pulsando el botón de reintento para obtener precios en vivo actualizados desde los servidores oficiales.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end mt-1">
                    <button
                      onClick={() => handleSearch(searchedTerm)}
                      className="bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 text-white text-xs font-display font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10 active:scale-98 flex items-center gap-1.5"
                    >
                      <span>Reintentar Búsqueda En Vivo</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : result.isFallback && (
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

            {/* Price Alert Creation Widget */}
            {result.offers && result.offers.length > 0 && (
              <section className="w-full">
                <CreatePriceAlert
                  productName={result.productName}
                  currentLowestPrice={result.offers.reduce((min, o) => (o.price && o.price < min) ? o.price : min, result.offers[0]?.price || 0)}
                  storeName={result.offers.reduce((best, o) => (o.price && o.price < (best.price || Infinity)) ? o : best, result.offers[0])?.shopName || "Coto"}
                  onCreateAlert={handleCreateAlert}
                  existingAlerts={alerts}
                  marketAveragePrice={
                    result.offers.filter(o => typeof o.price === "number" && o.price > 0).length > 0
                      ? result.offers.filter(o => typeof o.price === "number" && o.price > 0).reduce((sum, o) => sum + (o.price || 0), 0) / result.offers.filter(o => typeof o.price === "number" && o.price > 0).length
                      : undefined
                  }
                />
              </section>
            )}

            {/* IPC Inflation Adjustment Tool */}
            {result.offers && result.offers.length > 0 && (
              <section className="w-full">
                <IpcCalculator currentOffers={result.offers} />
              </section>
            )}

            {/* Potential Savings Calculator & Chart */}
            {result.offers && result.offers.length > 0 && (
              <section className="w-full">
                <PotentialSavings offers={result.offers} productName={result.productName} />
              </section>
            )}

            {/* Side-by-Side Comparison Section */}
            {result.offers && result.offers.length > 0 && comparedOffers.length > 0 && (
              <section className="w-full space-y-3">
                <AnimatePresence>
                  {comparisonWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full bg-rose-950/20 border-2 border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-xs font-semibold shadow-md"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                      <span>{comparisonWarning}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <ComparisonTable
                  selectedOffers={comparedOffers}
                  productName={result.productName}
                  onRemoveOffer={handleRemoveComparedOffer}
                  onClearComparison={handleClearComparison}
                />
              </section>
            )}

            {/* List of pricing cards */}
            <section className="w-full">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-[#131B2E] p-1.5 rounded-lg text-sky-400 border border-slate-800">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Ofertas Encontradas y Comparativas
                  </h3>
                </div>
                {result.offers && result.offers.length > 1 && (
                  <div className="text-xs text-slate-400 font-medium bg-indigo-950/20 border border-indigo-950 px-3 py-1.5 rounded-xl">
                    💡 Hacé clic en <strong className="text-pink-400">+ Comparar</strong> en {comparedOffers.length === 0 ? "las ofertas" : "otras tiendas"} para verlas lado a lado ({comparedOffers.length}/3)
                  </div>
                )}
              </div>

              {extremeSavingsMode && result.offers && result.offers.length > 0 && (
                <div className="w-full bg-amber-500/10 border border-amber-500/35 rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <p className="text-xs sm:text-sm text-amber-200 font-sans font-bold">
                      🔥 Modo Ahorro Extremo Activo: Filtrando para mostrar solo opciones con cuotas sin interés o descuentos bancarios activos.
                    </p>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl font-sans font-black shrink-0">
                    {result.offers.length - displayedOffers.length} {result.offers.length - displayedOffers.length === 1 ? "oferta oculta" : "ofertas ocultas"}
                  </span>
                </div>
              )}

              {result.offers && result.offers.length > 0 ? (
                displayedOffers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {displayedOffers.map((offer) => {
                        const isSelected = comparedOffers.some((o) => o.shopName === offer.shopName);
                        return (
                          <motion.div
                            key={offer.shopName}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ 
                              opacity: { duration: 0.25 },
                              scale: { duration: 0.25 },
                              y: { type: "spring", stiffness: 300, damping: 25 },
                              layout: { type: "spring", stiffness: 300, damping: 25 }
                            }}
                            className="h-full"
                          >
                            <OfferCard
                              offer={offer}
                              onUpdatePrice={handleUpdateOfferPrice}
                              isSelected={isSelected}
                              onToggleCompare={() => handleToggleCompare(offer)}
                              showCompareOption={result.offers.length > 1}
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto shadow-2xl">
                    <HelpCircle className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-bounce" />
                    <h4 className="font-display font-bold text-white">Ninguna oferta cumple el Modo Ahorro Extremo</h4>
                    <p className="text-slate-400 text-sm mt-1.5 font-sans leading-relaxed">
                      Ninguna de las {result.offers.length} tiendas encontradas tiene cuotas sin interés o beneficios bancarios disponibles para este producto hoy.
                    </p>
                    <button
                      onClick={() => setExtremeSavingsMode(false)}
                      className="mt-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                    >
                      Desactivar Filtro
                    </button>
                  </div>
                )
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

      {/* Real-time price alert notification toast */}
      <AnimatePresence>
        {triggeredAlertNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 w-full max-w-sm px-4 sm:px-0"
          >
            <div className="bg-[#0b101f] border-2 border-emerald-500 rounded-3xl p-5 shadow-[0_10px_40px_rgba(16,185,129,0.3)] relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />
              
              <div className="flex gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/35 rounded-2xl text-emerald-400 shrink-0 h-12 w-12 flex items-center justify-center animate-bounce">
                  <Bell className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" /> ¡ALERTA DE PRECIO DETECTADA!
                  </span>
                  <h4 className="font-sans font-black text-white text-sm leading-tight truncate">
                    {triggeredAlertNotification.productName}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-medium">
                    Bajó a <strong className="text-emerald-400 font-mono text-sm">${triggeredAlertNotification.currentLowestPrice.toLocaleString("es-AR")}</strong> en <span className="text-white font-semibold">{triggeredAlertNotification.storeName}</span>.
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">
                    Tu objetivo era: <span className="text-pink-400 font-mono font-bold">${triggeredAlertNotification.targetPrice.toLocaleString("es-AR")}</span> (¡Ahorrás ${(triggeredAlertNotification.initialPrice - triggeredAlertNotification.currentLowestPrice).toLocaleString("es-AR")}!)
                  </p>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => {
                        const storeSlug = triggeredAlertNotification.storeName.replace(/\s+/g, '-').toLowerCase();
                        const element = document.getElementById(`offer-card-${storeSlug}`);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "center" });
                          element.classList.add("ring-4", "ring-emerald-500/50");
                          setTimeout(() => element.classList.remove("ring-4"), 3000);
                        } else {
                          handleSearch(triggeredAlertNotification.productName);
                        }
                        setTriggeredAlertNotification(null);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-display font-black text-[10px] py-2 px-3 rounded-xl uppercase tracking-wider transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Ver Oferta</span>
                    </button>
                    <button
                      onClick={() => setTriggeredAlertNotification(null)}
                      className="px-3 py-2 bg-slate-900 hover:bg-[#131a30] text-slate-400 hover:text-white border border-indigo-950 rounded-xl text-[10px] font-display font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setTriggeredAlertNotification(null)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
