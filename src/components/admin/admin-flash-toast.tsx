"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { ADMIN_FLASH, type AdminFlashKey } from "@/lib/admin/flash";

function isFlashKey(value: string | null): value is AdminFlashKey {
  return value !== null && value in ADMIN_FLASH;
}

/** Legge `?ok=` dopo redirect delle Server Actions e mostra un toast di successo. */
export function AdminFlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const key = searchParams.get("ok");
    if (!isFlashKey(key)) return;

    toast.success(ADMIN_FLASH[key]);
    router.replace(pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
