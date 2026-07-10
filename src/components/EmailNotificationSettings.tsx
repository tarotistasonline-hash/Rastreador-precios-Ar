import React, { useState, useEffect } from "react";
import { Mail, Check, AlertCircle, Loader2, Shield, X, Send, Bell, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EmailNotificationSettingsProps {
  onSaveEmail: (email: string) => void;
  savedEmail: string;
  onClearEmail: () => void;
  activeAlertsCount: number;
}

export default function EmailNotificationSettings({
  onSaveEmail,
  savedEmail,
  onClearEmail,
  activeAlertsCount,
}: EmailNotificationSettingsProps) {
  const [emailInput, setEmailInput] = useState(savedEmail || "");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setEmailInput(savedEmail);
  }, [savedEmail]);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!emailInput) {
      setError("Por favor ingresá un correo electrónico.");
      return;
    }

    if (!validateEmail(emailInput)) {
      setError("Por favor ingresá un correo electrónico válido (ej. usuario@gmail.com).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailInput }),
      });

      if (!res.ok) {
        throw new Error("Error al suscribirse. Reintentá en unos momentos.");
      }

      const data = await res.json();
      onSaveEmail(emailInput);
      setSuccess(true);
      setTestSent(true);
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!savedEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/alerts/test-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: savedEmail }),
      });
      if (res.ok) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
      } else {
        throw new Error("No se pudo enviar el correo de prueba.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0b101f] border-2 border-indigo-500/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden" id="email-notification-settings">
      {/* Accent gradients */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-950/40 pb-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/35 rounded-2xl text-indigo-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Alertas por Correo
            </span>
            <h3 className="font-display font-black text-white text-base tracking-tight sm:text-lg">
              Notificaciones por Email
            </h3>
          </div>
        </div>

        {savedEmail && (
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-display font-black tracking-wide flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>ACTIVO</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
        Ingresá tu correo electrónico para recibir avisos inmediatos cuando detectemos rebajas en tus productos guardados. ¡Nunca más te pierdas una oferta real de supermercado!
      </p>

      {savedEmail ? (
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-indigo-950/80 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Correo Registrado
              </span>
              <span className="text-sm font-sans font-black text-white selection:bg-pink-500">
                {savedEmail}
              </span>
              <p className="text-[10px] text-indigo-300 mt-1">
                Monitoreando {activeAlertsCount} {activeAlertsCount === 1 ? "alerta activa" : "alertas activas"} en segundo plano.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isLoading}
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-500/40 font-display font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{testSent ? "¡Prueba Enviada!" : "Enviar Prueba"}</span>
              </button>

              <button
                type="button"
                onClick={onClearEmail}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                title="Desvincular Correo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-[#060810]/50 p-2.5 rounded-xl border border-indigo-950/30">
            <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Uso privado. Tus datos se guardan de forma segura localmente y no los compartimos con terceros.</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex-1 relative flex items-center">
              <Mail className="absolute left-4.5 text-slate-500 w-4.5 h-4.5" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="tu-correo@gmail.com"
                className="w-full bg-[#060810] border border-indigo-950 focus:border-indigo-500/60 rounded-xl py-3 pl-11 pr-4 font-sans font-semibold text-sm text-white focus:outline-hidden transition-all shadow-inner"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-11.5 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-display font-black text-xs uppercase tracking-wider transition-all hover:scale-102 active:scale-98 shadow-md shadow-indigo-500/10 hover:shadow-xl cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
              <span>Activar Correo</span>
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 px-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5 px-1 animate-pulse"
              >
                <Check className="w-3.5 h-3.5" />
                <span>¡Suscripción exitosa! Recibirás notificaciones en tu email.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      )}
    </div>
  );
}
