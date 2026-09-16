"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Elimina",
  pending = false,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 p-0 sm:max-w-md",
          // Mobile: bottom sheet fissato in viewport
          "top-auto bottom-0 left-0 max-w-none w-full translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl",
          // Desktop: centrato
          "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
        )}
      >
        <DialogHeader className="gap-2 px-5 pt-5 pb-2 text-left sm:px-6 sm:pt-6">
          <DialogTitle className="font-display text-xl text-brand-ink sm:text-lg">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter
          className={cn(
            "mx-0 mb-0 rounded-none border-t-0 bg-transparent p-5 pt-4 sm:mx-0 sm:mb-0 sm:rounded-b-xl sm:p-6 sm:pt-4",
            "pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6",
            "flex-col gap-2 sm:flex-row sm:justify-end",
          )}
        >
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-lg sm:h-10 sm:w-auto"
                disabled={pending}
              />
            }
          >
            Annulla
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            className="h-11 w-full rounded-lg sm:h-10 sm:w-auto sm:min-w-28"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Eliminazione…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
