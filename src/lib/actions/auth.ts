"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { provisionOrganizationForUser } from "@/lib/organizations/setup";
import { ACTIVE_PROJECT_COOKIE } from "@/lib/org/cookies";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      passwordHash,
      image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
    },
  });

  const { organizationSlug } = await provisionOrganizationForUser(
    user.id,
    data.name
  );

  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_PROJECT_COOKIE);

  return { success: true, userId: user.id, organizationSlug };
}
