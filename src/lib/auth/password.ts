import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  if (!hash || hash === "REPLACE_WITH_BCRYPT_HASH") {
    return false;
  }
  return bcrypt.compare(plain, hash);
}
