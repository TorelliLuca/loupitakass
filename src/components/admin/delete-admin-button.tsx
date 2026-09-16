"use client";

import { Loader2, Trash2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteAdminAction } from "@/app/admin/actions/auth";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";

const radius = { borderRadius: "0.5rem" } as const;

export function DeleteAdminButton({
  userId,
  email,
  disabledReason,
}: {
  userId: string;
  email: string;
  disabledReason?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const disabled = Boolean(disabledReason) || pending;

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteAdminAction(userId);
      } catch (error) {
        if (isRedirectError(error)) throw error;
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile eliminare l’utente.",
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
        disabled={disabled}
        title={disabledReason}
        aria-label={
          disabledReason
            ? `Elimina disabilitato: ${disabledReason}`
            : `Elimina ${email}`
        }
        onClick={() => {
          if (disabledReason) {
            toast.error(disabledReason);
            return;
          }
          setOpen(true);
        }}
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
        title="Eliminare l’utente admin?"
        description={
          <>
            Stai per eliminare{" "}
            <strong className="text-foreground">“{email}”</strong>. L’azione
            non si può annullare.
          </>
        }
        pending={pending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
