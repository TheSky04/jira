import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db";
import jwt from "jsonwebtoken";

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
}

const signToken = (user: User) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set!");
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "7d" });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const db = await connectDB();

    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({ message: "This email was already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "user";

    const [result] = await db.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    const insertId = (result as any).insertId;

    const token = signToken({
      id: insertId,
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "The user has been successfully created.",
      token,
      user: { id: insertId, username, email, role },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const db = await connectDB();
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    const users = rows as User[];

    if (!users || users.length === 0) {
      return res.status(400).json({ message: "There is no user with this email." });
    }

    const user = users[0];
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is wrong." });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
