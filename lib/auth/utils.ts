import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export type RegisterUserData = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

export const registerUser = async (userData: RegisterUserData) => {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create a new user
    const newUser = await db.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || "USER",
      },
    });

    // Return the user without the password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}; 