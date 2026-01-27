"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const LoginSchema = z.object({
  email: z.string().email({
    message: "El email es requerido",
  }),
  password: z.string().min(1, {
    message: "La contraseña es requerida",
  }),
});

const RegisterSchema = z.object({
  name: z.string().min(1, {
    message: "El nombre es requerido",
  }),
  email: z.string().email({
    message: "El email es requerido",
  }),
  password: z.string().min(6, {
    message: "Mínimo 6 caracteres",
  }),
});

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciales inválidas.";
        default:
          return "Algo salió mal.";
      }
    }
    throw error;
  }
}

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return "Campos inválidos.";
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const userHelper = await db.select().from(users).where(eq(users.email, email));
  if (userHelper[0]) {
    return "El usuario ya existe.";
  }

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // Automatically sign in after registration using the same credentials flow logic
  // However, signIn strictly takes formData or object.
  // We can just redirect to login or attempt sign in.
  // For simplicity, let's return a success message or allow the UI to redirect.
  return "success";
}
