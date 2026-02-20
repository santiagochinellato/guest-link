import { GUEST_LANGUAGES } from "@/db/schema";

/**
 * Formatea una fecha en formato español
 */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Deriva un código de 5 dígitos único del token
 */
export function getAccessCode(token: string): string {
  const num = parseInt(token.slice(-5), 16) % 100000;
  return String(num).padStart(5, "0");
}

/**
 * Etiquetas de idiomas para mostrar en la UI
 */
export const LANGUAGE_LABELS: Record<(typeof GUEST_LANGUAGES)[number], string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

/**
 * Plantillas de mensaje por idioma
 */
export const MESSAGE_TEMPLATES: Record<
  (typeof GUEST_LANGUAGES)[number],
  ReadonlyArray<{ name: string; text: string }>
> = {
  es: [
    {
      name: "Buenos días",
      text: `Buenos días! Muchas gracias por elegir #nombrepropiedad.

A continuación te acercamos el detalle de tu reserva, cómo llegar, wifi y recomendaciones pensadas para que aproveches al máximo tu estadía.

Tu CÓDIGO DE ACCESO es #codigo

[link a la web]

¡Te esperamos!`,
    },
    {
      name: "Hola casual",
      text: `¡Hola! Gracias por elegir #nombrepropiedad 👋

Te compartimos tu guía digital con el detalle de tu reserva, cómo llegar, wifi y recomendaciones.

Tu código de acceso es #codigo

Accede aquí: [link a la web]

¡Que disfrutes tu estadía!`,
    },
    {
      name: "Check-in directo",
      text: `Tu guía digital está lista.

Check-in: #checkin | Check-out: #checkout

Tu CÓDIGO DE ACCESO es #codigo

🔗 Accede a tu guía: [link a la web]`,
    },
  ],
  en: [
    {
      name: "Good morning",
      text: `Good morning! Thank you for choosing #nombrepropiedad.

Here is the detail of your reservation, how to get there, wifi and recommendations to make the most of your stay.

Your ACCESS CODE is #codigo

[link a la web]

We look forward to welcoming you!`,
    },
    {
      name: "Hello casual",
      text: `Hello! Thanks for choosing #nombrepropiedad 👋

We're sharing your digital guide with your reservation details, directions, wifi and recommendations.

Your access code is #codigo

Access here: [link a la web]

Enjoy your stay!`,
    },
    {
      name: "Check-in direct",
      text: `Your digital guide is ready.

Check-in: #checkin | Check-out: #checkout

Your ACCESS CODE is #codigo

🔗 Access your guide: [link a la web]`,
    },
  ],
  pt: [
    {
      name: "Bom dia",
      text: `Bom dia! Muito obrigado por escolher #nombrepropiedad.

A seguir enviamos o detalhe da sua reserva, como chegar, wifi e recomendações para aproveitar ao máximo sua estadia.

Seu CÓDIGO DE ACESSO é #codigo

[link a la web]

Esperamos por você!`,
    },
    {
      name: "Olá casual",
      text: `Olá! Obrigado por escolher #nombrepropiedad 👋

Compartilhamos sua guia digital com o detalhe da reserva, como chegar, wifi e recomendações.

Seu código de acesso é #codigo

Acesse aqui: [link a la web]

Aproveite sua estadia!`,
    },
    {
      name: "Check-in direto",
      text: `Sua guia digital está pronta.

Check-in: #checkin | Check-out: #checkout

Seu CÓDIGO DE ACESSO é #codigo

🔗 Acesse sua guia: [link a la web]`,
    },
  ],
  fr: [
    {
      name: "Bonjour",
      text: `Bonjour ! Merci d'avoir choisi #nombrepropiedad. Votre code d'accès est #codigo. [link a la web]`,
    },
  ],
  de: [
    {
      name: "Guten Tag",
      text: `Guten Tag! Danke, dass Sie #nombrepropiedad gewählt haben. Ihr Zugangscode ist #codigo. [link a la web]`,
    },
  ],
  it: [
    {
      name: "Buongiorno",
      text: `Buongiorno! Grazie per aver scelto #nombrepropiedad. Il tuo codice di accesso è #codigo. [link a la web]`,
    },
  ],
};

/**
 * Resuelve las variables en un mensaje de plantilla
 */
export function resolveMessage(
  msg: string,
  propertyName: string,
  accessCode: string,
  guestUrl: string,
  checkIn: string,
  checkOut: string
): string {
  return msg
    .replace(/#nombrepropiedad/g, propertyName)
    .replace(/#codigo/g, accessCode)
    .replace(/\[link a la web\]/g, guestUrl)
    .replace(/#checkin/g, formatDate(checkIn))
    .replace(/#checkout/g, formatDate(checkOut));
}

