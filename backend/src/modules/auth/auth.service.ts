import prisma from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

/**
 * Register user ใหม่
 */
export async function register(name: string, email: string, password: string) {
  // ตรวจสอบ email ซ้ำ
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // สร้าง user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Login user
 */
export async function login(email: string, password: string) {
  // หา user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // เปรียบเทียบ password
  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // สร้าง tokens
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  // บันทึก refresh token ใน DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 วัน

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh access token
 */
export async function refresh(token: string) {
  // Verify token
  const payload = verifyRefreshToken(token);

  // หา token ใน DB
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken) {
    throw new Error("INVALID_TOKEN");
  }

  // ตรวจสอบว่ายังไม่หมดอายุ
  if (refreshToken.expiresAt < new Date()) {
    // ลบ token ที่หมดอายุ
    await prisma.refreshToken.delete({
      where: { token },
    });
    throw new Error("TOKEN_EXPIRED");
  }

  // สร้าง access token ใหม่
  const accessToken = signAccessToken(payload.userId);

  return { accessToken };
}

/**
 * Logout user
 */
export async function logout(token: string) {
  // ลบ refresh token จาก DB
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
}
