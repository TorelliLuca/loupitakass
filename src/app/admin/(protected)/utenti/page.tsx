import Link from "next/link";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { FadeIn } from "@/components/motion/fade-in";

const panelRadius = { borderRadius: "1.25rem" } as const;

export default function AdminCreateUserPage() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-8 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-center lg:gap-10 xl:gap-14">
      <FadeIn className="max-w-md space-y-3 lg:max-w-none">
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Utenti
        </p>
        <h1 className="font-display text-3xl leading-tight text-brand-ink sm:text-4xl lg:text-[2.75rem]">
          Crea admin
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Aggiungi un utente autorizzato ad accedere all’area admin. Email e
          password vengono salvate in modo sicuro.
        </p>
        <ul className="hidden space-y-2 pt-2 text-sm text-muted-foreground lg:block">
          <li className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-brand-brass" />
            Solo chi è già loggato può creare nuovi account
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-brand-brass" />
            Password minimo 8 caratteri, hashata con bcrypt
          </li>
          <li className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-brand-brass" />
            L’accesso avviene da /admin/login
          </li>
        </ul>
      </FadeIn>

      <FadeIn
        delay={0.08}
        className="w-full bg-card p-5 text-card-foreground shadow-sm ring-1 ring-foreground/10 sm:p-8 lg:p-10"
        style={panelRadius}
      >
        <CreateAdminForm />
      </FadeIn>
    </div>
  );
}
