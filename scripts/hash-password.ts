import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run auth:hash-password -- "tua-password"');
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 12));
