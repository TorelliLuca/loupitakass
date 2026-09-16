"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions/auth";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToasts } from "@/hooks/use-action-toasts";

const initialState: LoginState = {};
const radius = { borderRadius: "0.5rem" } as const;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
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
            autoComplete="username"
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
            autoComplete="current-password"
            placeholder="••••••••"
            required
            disabled={pending}
            className="h-10"
            style={radius}
          />
        </div>

        <Button
          type="submit"
          className="h-10 w-full"
          style={radius}
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Accesso in corso…
            </>
          ) : (
            "Accedi"
          )}
        </Button>
      </form>
    </FadeIn>
  );
}
