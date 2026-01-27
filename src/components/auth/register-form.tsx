"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/actions/auth";
import { ArrowRight, Loader2, Mail, Lock, User, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    register,
    undefined,
  );
  const router = useRouter();

  useEffect(() => {
    if (errorMessage === "success") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000); // Redirect after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [errorMessage, router]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[350px] mx-auto">
      <div className="flex flex-col items-center gap-2 text-center mb-2">
        <div className="w-12 h-12 bg-[#0f756d]/10 rounded-xl flex items-center justify-center mb-2">
          <Image
            src="/guestHubLogo.png"
            alt="Logo"
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Crear cuenta
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Únete a GuestHub y comienza a gestionar
        </p>
      </div>

      <form action={dispatch} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
            Nombre Completo
          </label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#0f756d] transition-colors" />
            <input
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f756d]/20 focus:border-[#0f756d] transition-all"
              type="text"
              name="name"
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
            Email
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#0f756d] transition-colors" />
            <input
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f756d]/20 focus:border-[#0f756d] transition-all"
              type="email"
              name="email"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
            Contraseña
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#0f756d] transition-colors" />
            <input
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f756d]/20 focus:border-[#0f756d] transition-all"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-3 rounded-lg text-xs border",
              errorMessage === "success"
                ? "bg-green-50 border-green-200 text-green-600"
                : "bg-red-50 border-red-200 text-red-600",
            )}
          >
            {errorMessage === "success"
              ? "Cuenta creada con éxito. Redirigiendo..."
              : errorMessage}
          </motion.div>
        )}

        <button
          className="w-full h-11 bg-[#0f756d] hover:bg-[#0d635c] text-white rounded-xl font-medium text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#0f756d]/20 disabled:opacity-50 disabled:pointer-events-none"
          aria-disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Crear Cuenta"
          )}
          {!isPending && <UserPlus className="w-4 h-4" />}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-neutral-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-black px-2 text-gray-400">
            O regístrate con
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={async () => {
          await signIn("google", { redirectTo: "/dashboard" });
        }}
        className="w-full h-11 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </button>

      <p className="text-center text-xs text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-[#0f756d] hover:underline font-medium"
        >
          Inicia Sesión
        </Link>
      </p>
    </div>
  );
}
