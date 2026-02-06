"use server";

import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

export async function sendWhatsApp(to: string, body: string) {
  if (!accountSid || !authToken || !whatsappFrom) {
    console.error("[whatsapp] Twilio not configured");
    return { success: false, error: "WhatsApp not configured" };
  }

  const client = twilio(accountSid, authToken);
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to.replace(/^\+/, "")}`;

  try {
    const message = await client.messages.create({
      from: whatsappFrom,
      to: toFormatted,
      body,
    });
    return { success: true, sid: message.sid };
  } catch (err) {
    console.error("[whatsapp] Send failed:", err);
    return { success: false, error: String(err) };
  }
}
