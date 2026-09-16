"use client";

import { Loader2, Trash2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteEventAction } from "@/app/admin/actions/events";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";

const radius = { borderRadius: "0.5rem" } as const;

export function DeleteEventButton({
  eventId,
  title,
}: {
  eventId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteEventAction(eventId);
      } catch (error) {
        if (isRedirectError(error)) throw error;
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile eliminare l’evento.",
        );
        setOpen(false);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        style={radius}
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-3.5" aria-hidden />
        )}
        Elimina
      </Button>

      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title="Eliminare l’evento?"
        description={
          <>
            Stai per eliminare <strong className="text-foreground">“{title}”</strong>.
            L’azione non si può annullare.
          </>
        }
        pending={pending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
