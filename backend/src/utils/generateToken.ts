import jwt from "jsonwebtoken";

export const generateToken = (id: number) => {
  const secret = process.env.JWT_SECRET || "secret";
  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};
