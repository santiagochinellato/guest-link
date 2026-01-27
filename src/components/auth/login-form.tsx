"use client";

import { useActionState, useState, useEffect } from "react";
import { authenticate, register } from "@/lib/actions/auth";
import { Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const [loginError, loginDispatch, isLoginPending] = useActionState(
    authenticate,
    undefined,
  );

  const [registerState, registerDispatch, isRegisterPending] = useActionState(
    register,
    undefined,
  );

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (registerState === "success") {
      setShowSuccess(true);
      setIsLogin(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [registerState]);

  const toggleView = (login: boolean) => {
    setIsLogin(login);
    setShowSuccess(false); // Limpiar mensajes al cambiar
  };

  return (
    <div className="grid gap-[2vh] w-full max-w-[400px] mx-auto">
      <div className="flex flex-col space-y-[1vh] text-center">
        <div className="flex justify-center transition-all duration-500 ease-in-out">
          <div
            className={`relative transition-all duration-500 ${
              isLogin
                ? "w-[18vh] h-[18vh] min-w-[100px] min-h-[100px]"
                : "w-[12vh] h-[12vh] min-w-[80px] min-h-[80px]"
            } max-w-[160px] max-h-[160px] hover:scale-105`}
          >
            <Image
              src="/GUESTHUBVERTICALCOLOR.webp"
              alt="GuestHub Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Toggle Premium */}
        <div className="flex p-1 bg-neutral-100/80 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl mx-auto w-full max-w-[300px] shadow-inner border border-neutral-200/50 dark:border-neutral-700 mb-[1vh]">
          <button
            onClick={() => toggleView(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all text-center ${
              isLogin
                ? "bg-white dark:bg-neutral-900 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-neutral-800/50"
            }`}
          >
            Ingresar
          </button>
          <button
            onClick={() => toggleView(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all text-center ${
              !isLogin
                ? "bg-white dark:bg-neutral-900 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-neutral-800/50"
            }`}
          >
            Registrarse
          </button>
        </div>

        <div className="space-y-[0.5vh]">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight text-foreground line-clamp-1">
            {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
            {isLogin
              ? "Ingresa tus credenciales para continuar"
              : "Comienza a gestionar tus propiedades"}
          </p>
        </div>
      </div>

      <div className="grid gap-[1.5vh]">
        <AnimatePresence mode="wait">
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Cuenta creada exitosamente. Por favor, inicia sesión.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isLogin ? (
          <form action={loginDispatch} className="space-y-[2vh]">
            <div className="space-y-[1.5vh]">
              <div className="space-y-1">
                <label
                  className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-1"
                  htmlFor="email"
                >
                  Email Corporativo
                </label>
                <input
                  id="email"
                  className="flex h-10 md:h-12 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  type="email"
                  name="email"
                  placeholder="nombre@empresa.com"
                  required
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-1"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  id="password"
                  className="flex h-10 md:h-12 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  type="password"
                  name="password"
                  required
                />
              </div>
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 text-sm rounded-xl bg-destructive/5 text-destructive border border-destructive/10 font-medium"
              >
                {loginError}
              </motion.div>
            )}

            <button
              className="inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 md:h-12 w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
              aria-disabled={isLoginPending}
              disabled={isLoginPending}
            >
              {isLoginPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form action={registerDispatch} className="space-y-[2vh]">
            <div className="space-y-[1.5vh]">
              <div className="space-y-1">
                <label
                  className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-1"
                  htmlFor="name"
                >
                  Nombre Completo
                </label>
                <input
                  id="name"
                  className="flex h-10 md:h-12 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  type="text"
                  name="name"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div className="space-y-1">
                <label
                  className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-1"
                  htmlFor="register-email"
                >
                  Email Corporativo
                </label>
                <input
                  id="register-email"
                  className="flex h-10 md:h-12 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  type="email"
                  name="email"
                  placeholder="nombre@empresa.com"
                  required
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                />
              </div>
              <div className="space-y-1">
                <label
                  className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-1"
                  htmlFor="register-password"
                >
                  Contraseña
                </label>
                <input
                  id="register-password"
                  className="flex h-10 md:h-12 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  type="password"
                  name="password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {registerState && registerState !== "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 text-sm rounded-xl bg-destructive/5 text-destructive border border-destructive/10 font-medium"
              >
                {registerState}
              </motion.div>
            )}

            <button
              className="inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 md:h-12 w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
              aria-disabled={isRegisterPending}
              disabled={isRegisterPending}
            >
              {isRegisterPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Crear Cuenta
            </button>
          </form>
        )}

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-background px-4 text-muted-foreground font-medium">
              O continúa con
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await signIn("google", { redirectTo: "/dashboard" });
          }}
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
        <button
          onClick={() => toggleView(!isLogin)}
          className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
        >
          {isLogin ? "Regístrate" : "Ingresa ahora"}
        </button>
      </p>
    </div>
  );
}
