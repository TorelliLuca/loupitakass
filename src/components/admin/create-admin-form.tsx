"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import {
  createAdminAction,
  type CreateAdminState,
} from "@/app/admin/actions/auth";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToasts } from "@/hooks/use-action-toasts";

const initialState: CreateAdminState = {};
const radius = { borderRadius: "0.5rem" } as const;

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(
    createAdminAction,
    initialState,
  );
  useActionToasts(state, pending);

  return (
    <FadeIn y={8} inView={false}>
      <form action={formAction} className="space-y-5" aria-busy={pending}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="nome@esempio.com"
            required
            disabled={pending}
            className="h-10"
            style={radius}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Almeno 8 caratteri"
            minLength={8}
            required
            disabled={pending}
            className="h-10"
            style={radius}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Conferma password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Ripeti la password"
            minLength={8}
            required
            disabled={pending}
            className="h-10"
            style={radius}
          />
        </div>

        <Button
          type="submit"
          className="h-10 w-full sm:w-auto"
          style={radius}
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Creazione in corso…
            </>
          ) : (
            "Crea utente admin"
          )}
        </Button>
      </form>
    </FadeIn>
  );
}
