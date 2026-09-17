import { SiteLogo } from "@/components/brand/site-logo";
import { site } from "@/lib/site";

export function PageLoader({ label = "Caricamento" }: { label?: string }) {
  return (
    <div
      className="page-loader relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-brand-ink text-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand-pine)_35%,transparent)_0%,transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-brass)_12%,transparent),transparent)]"
        aria-hidden
      />

      <div className="page-loader__emblem relative flex size-44 items-center justify-center sm:size-52">
        <svg
          className="page-loader__ring page-loader__ring--outer absolute inset-0 size-full"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            stroke="color-mix(in oklch, var(--brand-brass) 55%, transparent)"
            strokeWidth="1"
            strokeDasharray="4 10"
          />
          <path
            d="M100 12a88 88 0 0 1 76.2 44"
            stroke="var(--brand-brass)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M100 188a88 88 0 0 1-76.2-44"
            stroke="var(--brand-brass)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <svg
          className="page-loader__ring page-loader__ring--inner absolute inset-[12%] size-[76%]"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="color-mix(in oklch, var(--brand-mist) 18%, transparent)"
            strokeWidth="1"
          />
          <path
            d="M28 100a72 72 0 0 1 52-69.2"
            stroke="color-mix(in oklch, var(--brand-brass) 80%, white)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M172 100a72 72 0 0 1-52 69.2"
            stroke="color-mix(in oklch, var(--brand-brass) 80%, white)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="page-loader__logo relative z-10 px-6">
          <SiteLogo
            width={168}
            variant="transparent"
            className="h-auto w-30 sm:w-36"
          />
        </div>
      </div>

      <p className="page-loader__wordmark mt-8 font-display text-2xl tracking-tight text-brand-brass sm:text-3xl">
        {site.name}
      </p>
      <span className="sr-only">{label}</span>
    </div>
  );
}
