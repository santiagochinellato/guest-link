import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden">
      {/* Columna Izquierda: Formulario */}
      <div className="flex flex-col justify-center items-center h-full overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-background relative lg:pr-12 xl:pr-24 no-scrollbar">
        <div className="w-full max-w-sm space-y-6">
          <LoginForm />
        </div>
      </div>

      {/* Columna Derecha: Visual / Video */}
      <div className="hidden lg:block relative bg-muted h-full overflow-hidden">
        <video
          src="/Videorec.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Testimonio / Cita Flotante (Opcional) */}
        <div className="absolute bottom-10 right-10 left-10 p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white shadow-2xl">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;GuestHub ha transformado completamente la forma en que
              gestionamos la experiencia de nuestros huéspedes.&rdquo;
            </p>
            <footer className="text-sm font-medium opacity-80">
              — Equipo de GuestHub
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
