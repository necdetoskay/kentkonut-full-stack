import { hashPassword as cryptoHashPassword } from "@/lib/crypto";
import { db } from "@/lib/db";
// Role enum removed from import
import { v4 as uuidv4 } from "uuid";

export const hashPassword = async (password: string): Promise<string> => {
  return cryptoHashPassword(password);
};

export type RegisterUserData = {
  name: string;
  email: string;
  password: string;
  role?: string;
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

    // Create a new user with a UUID
    const newUser = await db.user.create({
      data: {
        id: uuidv4(), // Generate a unique UUID for the user
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