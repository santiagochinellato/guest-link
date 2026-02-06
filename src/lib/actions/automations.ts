"use server";

import { db } from "@/db";
import { reservations, properties, automationLogs } from "@/db/schema";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";
import { render } from "@react-email/render";
import { PreArrivalEmail } from "@/emails/PreArrivalEmail";
import { CheckoutReminderEmail } from "@/emails/CheckoutReminderEmail";
import { ReviewRequestEmail } from "@/emails/ReviewRequestEmail";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://guest-link.vercel.app";

function getGuideUrl(slug: string, lang = "es") {
  return `${BASE_URL}/${lang}/stay/${slug}`;
}

async function logAutomation(
  reservationId: number,
  type: string,
  channel: string,
  status: "sent" | "error",
  error?: string
) {
  await db.insert(automationLogs).values({
    reservationId,
    type,
    channel,
    status,
    error: status === "error" ? error : null,
  });
}

export async function runPreArrivalAutomation() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const eligible = await db
    .select({
      reservation: reservations,
      property: properties,
    })
    .from(reservations)
    .innerJoin(properties, eq(reservations.propertyId, properties.id))
    .where(
      and(
        eq(reservations.status, "confirmed"),
        eq(reservations.preArrivalSent, false),
        eq(properties.autoSendGuide, true),
        eq(reservations.checkIn, tomorrow)
      )
    );

  const results: { id: number; success: boolean; error?: string }[] = [];

  for (const row of eligible) {
    const { reservation, property } = row;
    const email = reservation.guestEmail;
    const phone = reservation.guestPhone;

    if (!email && !phone) {
      await logAutomation(reservation.id, "pre_arrival", "none", "error", "No email or phone");
      results.push({ id: reservation.id, success: false, error: "No contact" });
      continue;
    }

    const guideUrl = getGuideUrl(property.slug);

    if (email) {
      const guestName = parseGuestInfo(reservation.guestName).name;
      const html = await render(
        PreArrivalEmail({
          guestName,
          propertyName: property.name,
          checkIn: reservation.checkIn,
          guideUrl,
        })
      );
      const res = await sendEmail({
        to: email,
        subject: `Tu guía digital - ${property.name}`,
        html,
      });
      if (res.success) {
        await db
          .update(reservations)
          .set({ preArrivalSent: true, updatedAt: new Date() })
          .where(eq(reservations.id, reservation.id));
        await logAutomation(reservation.id, "pre_arrival", "email", "sent");
        results.push({ id: reservation.id, success: true });
      } else {
        await logAutomation(reservation.id, "pre_arrival", "email", "error", res.error);
        results.push({ id: reservation.id, success: false, error: res.error });
      }
    }

    if (phone && !results.find((r) => r.id === reservation.id)?.success) {
      const guestName = parseGuestInfo(reservation.guestName).name;
      const body = `Hola ${guestName}! Tu guía digital para ${property.name} (check-in ${reservation.checkIn}): ${guideUrl}`;
      const res = await sendWhatsApp(phone, body);
      if (res.success) {
        await db
          .update(reservations)
          .set({ preArrivalSent: true, updatedAt: new Date() })
          .where(eq(reservations.id, reservation.id));
        await logAutomation(reservation.id, "pre_arrival", "whatsapp", "sent");
        results.push({ id: reservation.id, success: true });
      } else {
        await logAutomation(reservation.id, "pre_arrival", "whatsapp", "error", res.error);
        results.push({ id: reservation.id, success: false, error: res.error });
      }
    }
  }

  return { processed: eligible.length, results };
}

export async function runCheckoutReminderAutomation() {
  const today = new Date().toISOString().split("T")[0];

  const eligible = await db
    .select({
      reservation: reservations,
      property: properties,
    })
    .from(reservations)
    .innerJoin(properties, eq(reservations.propertyId, properties.id))
    .where(
      and(
        eq(reservations.status, "confirmed"),
        eq(reservations.checkoutReminderSent, false),
        eq(properties.autoCheckoutReminder, true),
        eq(reservations.checkOut, today)
      )
    );

  const results: { id: number; success: boolean; error?: string }[] = [];

  for (const row of eligible) {
    const { reservation, property } = row;
    const email = reservation.guestEmail;
    const phone = reservation.guestPhone;

    if (!email && !phone) {
      await logAutomation(reservation.id, "checkout_reminder", "none", "error", "No email or phone");
      results.push({ id: reservation.id, success: false, error: "No contact" });
      continue;
    }

    const guideUrl = getGuideUrl(property.slug);
    const checkOutTime = property.checkOutTime || "11:00";

    if (email) {
      const guestName = parseGuestInfo(reservation.guestName).name;
      const html = await render(
        CheckoutReminderEmail({
          guestName,
          propertyName: property.name,
          checkOut: reservation.checkOut,
          checkOutTime,
          guideUrl,
        })
      );
      const res = await sendEmail({
        to: email,
        subject: `Recordatorio check-out - ${property.name}`,
        html,
      });
      if (res.success) {
        await db
          .update(reservations)
          .set({ checkoutReminderSent: true, updatedAt: new Date() })
          .where(eq(reservations.id, reservation.id));
        await logAutomation(reservation.id, "checkout_reminder", "email", "sent");
        results.push({ id: reservation.id, success: true });
      } else {
        await logAutomation(reservation.id, "checkout_reminder", "email", "error", res.error);
        results.push({ id: reservation.id, success: false, error: res.error });
      }
    }

    if (phone && !results.find((r) => r.id === reservation.id)?.success) {
      const guestName = parseGuestInfo(reservation.guestName).name;
      const body = `Hola ${guestName}! Recordatorio: tu check-out de ${property.name} es hoy a las ${checkOutTime}. Guía: ${guideUrl}`;
      const res = await sendWhatsApp(phone, body);
      if (res.success) {
        await db
          .update(reservations)
          .set({ checkoutReminderSent: true, updatedAt: new Date() })
          .where(eq(reservations.id, reservation.id));
        await logAutomation(reservation.id, "checkout_reminder", "whatsapp", "sent");
        results.push({ id: reservation.id, success: true });
      } else {
        await logAutomation(reservation.id, "checkout_reminder", "whatsapp", "error", res.error);
        results.push({ id: reservation.id, success: false, error: res.error });
      }
    }
  }

  return { processed: eligible.length, results };
}

export async function runReviewRequestAutomation() {
  const today = new Date().toISOString().split("T")[0];

  const eligible = await db
    .select({
      reservation: reservations,
      property: properties,
    })
    .from(reservations)
    .innerJoin(properties, eq(reservations.propertyId, properties.id))
    .where(
      and(
        eq(reservations.status, "confirmed"),
        eq(reservations.reviewRequestSent, false),
        eq(properties.autoReviewRequest, true),
        eq(reservations.checkOut, today)
      )
    );

  const results: { id: number; success: boolean; error?: string }[] = [];
  const reviewUrl = process.env.REVIEW_LINK_URL || "#";

  for (const row of eligible) {
    const { reservation, property } = row;
    const email = reservation.guestEmail;
    const phone = reservation.guestPhone;

    if (!email && !phone) {
      await logAutomation(reservation.id, "review_request", "none", "error", "No email or phone");
      results.push({ id: reservation.id, success: false, error: "No contact" });
      continue;
    }

    if (email) {
      const guestName = parseGuestInfo(reservation.guestName).name;
      const html = await render(
        ReviewRequestEmail({
          guestName,
          propertyName: property.name,
          reviewUrl,
        })
      );
      const res = await sendEmail({
        to: email,
        subject: `¿Cómo fue tu estancia en ${property.name}?`,
        html,
      });
      if (res.success) {
        await db
          .update(reservations)
          .set({ reviewRequestSent: true, updatedAt: new Date() })
          .where(eq(reservations.id, reservation.id));
        await logAutomation(reservation.id, "review_request", "email", "sent");
        results.push({ id: reservation.id, success: true });
      } else {
        await logAutomation(reservation.id, "review_request", "email", "error", res.error);
        results.push({ id: reservation.id, success: false, error: res.error });
      }
    }

    if (phone && !results.find((r) => r.id === reservation.id)?.success) {
      const guestName = parseGuestInfo(reservation.guestName).name;
      const body = `Hola ${guestName}! ¿Cómo fue tu estancia en ${property.name}? Nos encantaría tu opinión.`;
      const res = await sendWhatsApp(phone, body);
      if (res.success) {
        await db
          .update(reservations)
          .set({ reviewRequestSent: true, updatedAt: new Date() })
          .where(eq(reservations.id, reservation.id));
        await logAutomation(reservation.id, "review_request", "whatsapp", "sent");
        results.push({ id: reservation.id, success: true });
      } else {
        await logAutomation(reservation.id, "review_request", "whatsapp", "error", res.error);
        results.push({ id: reservation.id, success: false, error: res.error });
      }
    }
  }

  return { processed: eligible.length, results };
}
