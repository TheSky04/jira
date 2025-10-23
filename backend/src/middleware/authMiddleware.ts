import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token can not be found." });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "secret";

  try {
    const decoded = jwt.verify(token!, secret) as unknown as { id: number; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User information can not be found." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You have no permission to access this page!" });
    }

    next();
  };
};
