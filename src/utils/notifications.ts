import { PriceAlert } from "../types";
import { trackEvent } from "./mixpanel";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermissionStatus(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  
  try {
    const permission = await Notification.requestPermission();
    trackEvent("notification_permission_requested", { result: permission });
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return Notification.permission;
  }
}

export function sendPriceAlertNotification(alert: PriceAlert) {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== "granted") return;

  const discountPct = alert.initialPrice > alert.currentLowestPrice
    ? Math.round(((alert.initialPrice - alert.currentLowestPrice) / alert.initialPrice) * 100)
    : 0;

  const title = `🚨 ¡Baja de precio detectada! - ${alert.productName}`;
  const options: NotificationOptions = {
    body: `¡Llegó a tu precio objetivo! El precio actual es de $${alert.currentLowestPrice.toLocaleString("es-AR")} en ${alert.storeName}.${
      discountPct > 0 ? ` (${discountPct}% de ahorro desde que lo agregaste)` : ""
    }`,
    icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png", // A high quality bell alert icon
    tag: `price-alert-${alert.id}`,
    requireInteraction: true,
  };

  try {
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      
      // Try to scroll to the price alert manager or highlight the alert card
      const element = document.getElementById(`price-alerts-manager`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      
      trackEvent("notification_clicked", { alert_id: alert.id, product_name: alert.productName });
      notification.close();
    };
  } catch (error) {
    console.error("Error sending native notification:", error);
  }
}

/**
 * Sends a welcome/test notification to confirm permissions are working perfectly
 */
export function sendTestNotification() {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;

  try {
    const title = `🔔 ¡Notificaciones de Precios AR Activas!`;
    const options: NotificationOptions = {
      body: "¡Felicitaciones! Recibirás notificaciones nativas en tu pantalla cada vez que un producto baje del precio objetivo que configuraste.",
      icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
      tag: "test-notification",
    };
    new Notification(title, options);
    trackEvent("test_notification_sent");
  } catch (err) {
    console.error("Failed to send test notification:", err);
  }
}
