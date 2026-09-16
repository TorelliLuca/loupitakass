"use server";

import { count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getClientIpFromHeaders } from "@/lib/auth/client-ip";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { checkLoginRateLimit } from "@/lib/auth/rate-limit";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { adminUsersRedirect } from "@/lib/admin/flash";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

const loginSchema = z.object({
  email: z.string().trim().email("Email non valida."),
  password: z.string().min(1, "Inserisci la password."),
});

const createAdminSchema = z
  .object({
    email: z.string().trim().email("Email non valida."),
    password: z
      .string()
      .min(8, "La password deve avere almeno 8 caratteri."),
    confirmPassword: z.string().min(1, "Conferma la password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  });

const updateAdminSchema = z
  .object({
    email: z.string().trim().email("Email non valida."),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.password && !data.confirmPassword) return;
    if (data.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "La password deve avere almeno 8 caratteri.",
        path: ["password"],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Le password non coincidono.",
        path: ["confirmPassword"],
      });
    }
  });

export type LoginState = {
  error?: string;
};

export type CreateAdminState = {
  error?: string;
  success?: string;
};

export type UpdateAdminState = {
  error?: string;
  success?: string;
};

async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

function revalidateAdminUsers() {
  revalidatePath("/admin/utenti/gestisci");
  revalidatePath("/admin/utenti");
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const ip = await getClientIpFromHeaders();
  const rateLimit = await checkLoginRateLimit(ip);
  if (!rateLimit.success) {
    return {
      error: "Troppi tentativi. Riprova tra qualche minuto.",
    };
  }

  try {
    const db = getDb();
    const email = parsed.data.email.toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (
      !user ||
      !(await verifyPassword(parsed.data.password, user.passwordHash))
    ) {
      return { error: "Email o password non corretti." };
    }

    await setSessionCookie({ userId: user.id, email: user.email });
  } catch (error) {
    console.error("[admin/login]", error);
    const message =
      error instanceof Error ? error.message : "Errore di accesso.";
    if (
      message.includes("AUTH_SECRET") ||
      message.includes("DATABASE_URL") ||
      message.includes("POSTGRES")
    ) {
      return {
        error:
          "Configurazione server incompleta (env). Controlla AUTH_SECRET e DATABASE_URL.",
      };
    }
    return { error: "Errore di accesso. Riprova più tardi." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function createAdminAction(
  _prev: CreateAdminState,
  formData: FormData,
): Promise<CreateAdminState> {
  await requireAdmin();

  const parsed = createAdminSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const db = getDb();
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return { error: "Esiste già un utente con questa email." };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await db.insert(users).values({ email, passwordHash });
  } catch (error) {
    console.error("[admin/create-admin]", error);
    const message =
      error instanceof Error ? error.message : "Errore di creazione.";
    if (
      message.includes("DATABASE_URL") ||
      message.includes("POSTGRES") ||
      message.includes("AUTH_SECRET")
    ) {
      return {
        error:
          "Configurazione server incompleta (env). Controlla AUTH_SECRET e DATABASE_URL.",
      };
    }
    return { error: "Impossibile creare l’utente. Riprova più tardi." };
  }

  revalidateAdminUsers();
  redirect(adminUsersRedirect("user-created"));
}

export async function updateAdminAction(
  userId: string,
  _prev: UpdateAdminState,
  formData: FormData,
): Promise<UpdateAdminState> {
  const session = await requireAdmin();

  const parsed = updateAdminSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const db = getDb();
    const [target] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!target) {
      return { error: "Utente non trovato." };
    }

    const [emailTaken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (emailTaken && emailTaken.id !== userId) {
      return { error: "Esiste già un utente con questa email." };
    }

    const updates: { email: string; passwordHash?: string } = { email };
    if (parsed.data.password) {
      updates.passwordHash = await hashPassword(parsed.data.password);
    }

    await db.update(users).set(updates).where(eq(users.id, userId));

    if (session.userId === userId && session.email !== email) {
      await setSessionCookie({ userId, email });
    }
  } catch (error) {
    console.error("[admin/update-admin]", error);
    return { error: "Impossibile aggiornare l’utente. Riprova più tardi." };
  }

  revalidateAdminUsers();
  revalidatePath(`/admin/utenti/${userId}`);
  redirect(adminUsersRedirect("user-updated"));
}

export async function deleteAdminAction(userId: string) {
  const session = await requireAdmin();

  if (session.userId === userId) {
    throw new Error("Non puoi eliminare il tuo account mentre sei collegato.");
  }

  const db = getDb();
  const [[{ total }], [target]] = await Promise.all([
    db.select({ total: count() }).from(users),
    db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
  ]);

  if (!target) {
    throw new Error("Utente non trovato.");
  }

  if (total <= 1) {
    throw new Error("Non puoi eliminare l’ultimo utente admin.");
  }

  const [other] = await db
    .select({ id: users.id })
    .from(users)
    .where(ne(users.id, userId))
    .limit(1);

  if (!other) {
    throw new Error("Non puoi eliminare l’ultimo utente admin.");
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
  } catch (error) {
    console.error("[admin/delete-admin]", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Impossibile eliminare l’utente.",
    );
  }

  revalidateAdminUsers();
  redirect(adminUsersRedirect("user-deleted"));
}
