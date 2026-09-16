"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { getClientIpFromHeaders } from "@/lib/auth/client-ip";
import { checkContactRateLimit } from "@/lib/auth/rate-limit";
import { getContactMailConfig, getResend } from "@/lib/email/resend";
import { site } from "@/lib/site";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().min(1).max(200).email(),
  message: z.string().trim().min(1).max(5000),
  company: z.string().optional(),
  privacy: z.literal("1"),
});

export type ContactState = {
  error?: string;
  success?: string;
  fieldErrors?: {
    email?: string;
    privacy?: string;
  };
};

export async function sendContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const t = await getTranslations("ContactForm");

  const privacyValue = formData.get("privacy");
  if (privacyValue !== "1") {
    return {
      error: t("privacyRequired"),
      fieldErrors: { privacy: t("privacyRequired") },
    };
  }

  const emailRaw = String(formData.get("email") ?? "").trim();
  if (!emailRaw) {
    return {
      error: t("emailRequired"),
      fieldErrors: { email: t("emailRequired") },
    };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: emailRaw,
    message: formData.get("message"),
    company: formData.get("company") ?? "",
    privacy: privacyValue,
  });

  if (!parsed.success) {
    const emailIssue = parsed.error.issues.find((issue) => issue.path[0] === "email");
    if (emailIssue) {
      return {
        error: t("emailInvalid"),
        fieldErrors: { email: t("emailInvalid") },
      };
    }
    return { error: t("error") };
  }

  const { name, email, message, company } = parsed.data;

  // Honeypot: finge successo senza inviare.
  if (company && company.trim() !== "") {
    return { success: t("success") };
  }

  const ip = await getClientIpFromHeaders();
  const limit = await checkContactRateLimit(ip);
  if (!limit.success) {
    return { error: t("rateLimited") };
  }

  try {
    const resend = getResend();
    const { to, from } = getContactMailConfig();

    const { error } = await resend.emails.send({
      from: `${site.name} <${from}>`,
      to: [to],
      replyTo: email,
      subject: `Contatto sito — ${name}`,
      text: [`Nome: ${name}`, `Email: ${email}`, "", message].join("\n"),
    });

    if (error) {
      console.error("[contact] Resend error:", error.message);
      return { error: t("error") };
    }

    return { success: t("success") };
  } catch (err) {
    console.error("[contact] send failed:", err);
    return { error: t("error") };
  }
}
