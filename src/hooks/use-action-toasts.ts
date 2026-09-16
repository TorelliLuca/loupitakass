"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionFeedback = {
  error?: string;
  success?: string;
};

/**
 * Mostra toast da `useActionState` (error / success).
 * Ri-emette anche lo stesso messaggio dopo un nuovo submit (pending → done).
 */
export function useActionToasts(
  state: ActionFeedback,
  pending = false,
) {
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
      return;
    }

    if (!wasPending.current) return;
    wasPending.current = false;

    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success(state.success);
    }
  }, [pending, state.error, state.success]);
}
