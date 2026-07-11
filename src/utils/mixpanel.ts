import mixpanel from "mixpanel-browser";

// Standard development fallback token or user configured token
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || "";

let isInitialized = false;

/**
 * Initializes Mixpanel with standard properties and configurations.
 * If no token is provided, it falls back gracefully to logging events
 * in the console for local debugging and verification.
 */
export const initMixpanel = () => {
  if (isInitialized) return;
  
  if (MIXPANEL_TOKEN && MIXPANEL_TOKEN.trim() !== "") {
    try {
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: true, // Enable debug prints in console for verified tracking
        track_pageview: true,
        persistence: "localStorage",
      });
      isInitialized = true;
      console.log("📊 Mixpanel initialized successfully with token.");
    } catch (err) {
      console.error("❌ Failed to initialize Mixpanel:", err);
    }
  } else {
    console.log("ℹ️ Mixpanel: Token not found in environment. Running in developer-debug/console logging mode.");
    isInitialized = true;
  }
};

/**
 * Tracks an event to Mixpanel or prints to console if no token is defined.
 * @param eventName Name of the telemetry action
 * @param properties Optional metadata payload for the event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Ensure initialized
  initMixpanel();

  const enrichedProperties = {
    ...properties,
    platform: "Web",
    environment: import.meta.env.MODE || "development",
    timestamp: new Date().toISOString(),
    referrer: document.referrer || "direct",
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
  };

  if (MIXPANEL_TOKEN && MIXPANEL_TOKEN.trim() !== "") {
    try {
      mixpanel.track(eventName, enrichedProperties);
    } catch (err) {
      console.error(`❌ Failed to track event "${eventName}":`, err);
    }
  } else {
    // Print styled telemetry in console for developers to easily verify their tracking tags
    console.log(
      `%c📊 [Mixpanel Simulation] Event: "${eventName}"`,
      "background: #4F46E5; color: white; font-weight: bold; padding: 2px 6px; rounded: 4px;",
      enrichedProperties
    );
  }
};
