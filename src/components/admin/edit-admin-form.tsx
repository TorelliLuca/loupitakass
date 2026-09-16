"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import {
  updateAdminAction,
  type UpdateAdminState,
} from "@/app/admin/actions/auth";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToasts } from "@/hooks/use-action-toasts";

const initialState: UpdateAdminState = {};
const radius = { borderRadius: "0.5rem" } as const;

type EditAdminFormProps = {
  userId: string;
  email: string;
};

export function EditAdminForm({ userId, email }: EditAdminFormProps) {
  const boundAction = updateAdminAction.bind(null, userId);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );
  useActionToasts(state, pending);

  return (
    <FadeIn y={8} inView={false}>
      <form
        action={formAction}
        className="flex flex-col gap-5 sm:gap-6"
        aria-busy={pending}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            autoComplete="off"
            required
            disabled={pending}
            className="h-11 text-base sm:text-sm"
            style={radius}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nuova password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Lascia vuoto per non cambiare"
              minLength={8}
              disabled={pending}
              className="h-11 text-base sm:text-sm"
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
              placeholder="Solo se cambi password"
              minLength={8}
              disabled={pending}
              className="h-11 text-base sm:text-sm"
              style={radius}
            />
          </div>
        </div>

        <div className="pt-1 sm:pt-2">
          <Button
            type="submit"
            className="h-11 w-full sm:h-10 sm:w-auto sm:min-w-48"
            style={radius}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Salvataggio…
              </>
            ) : (
              "Salva modifiche"
            )}
          </Button>
        </div>
      </form>
    </FadeIn>
  );
}
