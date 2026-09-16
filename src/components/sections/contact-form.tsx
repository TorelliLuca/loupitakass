"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  sendContactAction,
  type ContactState,
} from "@/app/actions/contact";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { FadeIn } from "@/components/motion/fade-in";
import { OccitanCrossMark } from "@/components/brand/occitan-watermark";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, SectionHeading } from "@/components/sections/section";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const initialState: ContactState = {};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldInputClass =
  "h-12 rounded-none border-0 border-b border-brand-ink/20 bg-transparent px-0 shadow-none focus-visible:border-brand-ink focus-visible:ring-0";

export function ContactFormSection() {
  const t = useTranslations("ContactForm");
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [privacyHint, setPrivacyHint] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    sendContactAction,
    initialState,
  );
  useActionToasts(state, pending);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setEmailHint(null);
      setPrivacyHint(null);
    }
  }, [state.success]);

  useEffect(() => {
    if (state.fieldErrors?.email) {
      setEmailHint(state.fieldErrors.email);
      emailRef.current?.focus();
    }
    if (state.fieldErrors?.privacy) {
      setPrivacyHint(state.fieldErrors.privacy);
    }
  }, [state.fieldErrors]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const email = emailRef.current?.value.trim() ?? "";
    if (!email) {
      event.preventDefault();
      setEmailHint(t("emailRequired"));
      emailRef.current?.focus();
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      event.preventDefault();
      setEmailHint(t("emailInvalid"));
      emailRef.current?.focus();
      return;
    }
    setEmailHint(null);

    if (!privacyRef.current?.checked) {
      event.preventDefault();
      setPrivacyHint(t("privacyRequired"));
      privacyRef.current?.focus();
      return;
    }
    setPrivacyHint(null);
  }

  return (
    <Section id="scrivi" wide cross={false}>
      <FadeIn>
        <SectionHeading title={t("title")} lead={t("lead")} align="center" />
      </FadeIn>
      <FadeIn delay={0.08}>
        <div className="relative mx-auto max-w-lg">
          <OccitanCrossMark
            size="sm"
            placement="below"
            className="occitan-section-emblem--form-back"
          />
          <form
            ref={formRef}
            action={formAction}
            onSubmit={handleSubmit}
            className="relative z-10 grid gap-5"
            noValidate
            aria-busy={pending}
          >
          <div className="grid gap-2">
            <Label htmlFor="contact-name">{t("name")}</Label>
            <Input
              id="contact-name"
              name="name"
              required
              autoComplete="name"
              disabled={pending}
              className={fieldInputClass}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-email">{t("email")}</Label>
            <Input
              ref={emailRef}
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={pending}
              aria-invalid={emailHint ? true : undefined}
              aria-describedby={emailHint ? "contact-email-error" : undefined}
              onChange={() => {
                if (emailHint) setEmailHint(null);
              }}
              className={cn(
                fieldInputClass,
                emailHint && "border-red-700/70 focus-visible:border-red-700",
              )}
            />
            {emailHint ? (
              <p
                id="contact-email-error"
                role="alert"
                className="text-sm leading-snug text-red-700"
              >
                {emailHint}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-message">{t("message")}</Label>
            <Textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              disabled={pending}
              className="min-h-32 rounded-none border-0 border-b border-brand-ink/20 bg-transparent px-0 shadow-none focus-visible:border-brand-ink focus-visible:ring-0"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-start gap-3">
              <input
                ref={privacyRef}
                id="contact-privacy"
                name="privacy"
                type="checkbox"
                value="1"
                required
                disabled={pending}
                aria-invalid={privacyHint ? true : undefined}
                aria-describedby={
                  privacyHint ? "contact-privacy-error" : undefined
                }
                onChange={() => {
                  if (privacyRef.current?.checked) setPrivacyHint(null);
                }}
                className={cn(
                  "mt-1 size-4 shrink-0 accent-[var(--brand-ink)]",
                  privacyHint &&
                    "outline outline-2 outline-offset-2 outline-red-700/70",
                )}
              />
              <label
                htmlFor="contact-privacy"
                className="min-w-0 flex-1 text-sm font-normal leading-relaxed text-brand-ink/75"
              >
                {t.rich("privacyConsent", {
                  privacy: (chunks) => (
                    <Link
                      href="/privacy"
                      className="underline underline-offset-2 transition-colors hover:text-brand-ink"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </label>
            </div>
            {privacyHint ? (
              <p
                id="contact-privacy-error"
                role="alert"
                className="pl-7 text-sm leading-snug text-red-700"
              >
                {privacyHint}
              </p>
            ) : null}
          </div>

          <div className="absolute -left-[9999px] opacity-0" aria-hidden>
            <Label htmlFor="company">{t("honeypot")}</Label>
            <Input
              id="company"
              name="company"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="cta-pill mt-2 w-fit justify-self-center disabled:opacity-60"
          >
            {pending ? t("sending") : t("submit")}
          </button>
          </form>
        </div>
      </FadeIn>
    </Section>
  );
}
