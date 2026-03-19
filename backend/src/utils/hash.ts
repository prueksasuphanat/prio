import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash password ด้วย bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * เปรียบเทียบ password กับ hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns true ถ้าตรงกัน
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
