import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db";
import { generateToken } from "../utils/generateToken";
import { User } from "../models/User";

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tüm alanlar zorunludur." });
  }

  const db = await connectDB();

  const [existingUser] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if ((existingUser as any[]).length > 0) {
    return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword]
  );

  res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu." });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = await connectDB();

  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  const users = rows as User[];

  if (users.length === 0) {
    return res.status(400).json({ message: "Kullanıcı bulunamadı." });
  }

  const user = users[0]!;
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Şifre hatalı." });
  }

  const token = generateToken(user.id!);

  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
};
