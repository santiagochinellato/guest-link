"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";
import { Loader2 } from "lucide-react";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { getTimeBasedGreeting } from "@/lib/utils/dates";

interface GuestWelcomeScreenProps {
  propertyName: string;
  coverImage?: string | null;
  guestName?: string;
  onDismiss: () => void;
}

export function GuestWelcomeScreen({
  propertyName,
  coverImage,
  guestName,
  onDismiss,
}: GuestWelcomeScreenProps) {
  // Pre-filled credentials for convenience as requested
  const [email, setEmail] = useState("demo@email.com");
  const [code, setCode] = useState("12345");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Extract first name from guestName
  const firstName = useMemo(() => {
    if (!guestName) return null;
    const { name } = parseGuestInfo(guestName);
    // Get first name only
    return name.split(" ")[0] || name;
  }, [guestName]);
  
  const greeting = useMemo(() => getTimeBasedGreeting(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email === "demo@email.com" && code === "12345") {
      onDismiss();
    } else {
      setError("Credenciales incorrectas. Intenta de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6 text-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      {coverImage && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt="Welcome Background"
            className="w-full h-full object-cover animate-in fade-in duration-1000"
          />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-sm px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="w-[300px] mb-6 drop-shadow-2xl"
        >
          {/* Logo in White */}
          <HostlyLogoVertical className="w-full h-auto text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full space-y-8"
        >
          <div className="space-y-4 text-center">
            {firstName ? (
              <p className="text-white/80 text-[14px] font-bold tracking-[0.3em] uppercase drop-shadow-md">
                ¡{greeting}, {firstName}!
              </p>
            ) : (
              <p className="text-white/80 text-[14px] font-bold tracking-[0.3em] uppercase drop-shadow-md">
                ¡{greeting}!
              </p>
            )}
            <p className="text-white/80 text-[14px] font-bold tracking-[0.3em] uppercase drop-shadow-md">
              Te damos la bienvenida a
            </p>
            <h1 className="text-4xl sm:text-4xl font-medium text-white drop-shadow-lg leading-tight">
              {propertyName}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-1.5 text-left group">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest ml-1 group-focus-within:text-white transition-colors">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all text-sm font-light shadow-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left group">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest ml-1 group-focus-within:text-white transition-colors">
                Código de Validación
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all text-sm font-light tracking-widest shadow-lg"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs text-center font-medium bg-red-900/20 py-2 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-brand-void font-bold uppercase tracking-[0.15em] text-xs py-4 rounded-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] active:scale-[0.98] hover:bg-white/90 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
