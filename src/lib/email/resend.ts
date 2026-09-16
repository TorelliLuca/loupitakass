import { Resend } from "resend";

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY non configurata.");
  }
  return new Resend(apiKey);
}

export function getContactMailConfig() {
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "noreply@loupitakass.com";

  if (!to) {
    throw new Error("CONTACT_TO_EMAIL non configurata.");
  }

  return { to, from };
}
