import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  TokenPayload,
} from "../utils/jwt";
import { User } from "../models";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (err: any) {
      // Access token expired - try refresh
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.headers["x-refresh-token"] as string;

        if (!refreshToken) {
          res
            .status(401)
            .json({ message: "Access token expired, no refresh token" });
          return;
        }

        try {
          const refreshPayload = verifyRefreshToken(refreshToken);
          const user = await User.findOne({
            where: { id: refreshPayload.id, refresh_token: refreshToken },
          });

          if (!user) {
            res.status(401).json({ message: "Invalid refresh token" });
            return;
          }

          const newPayload: TokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
          };

          const newAccessToken = generateAccessToken(newPayload);
          res.setHeader("x-new-access-token", newAccessToken);
          req.user = newPayload;
          next();
        } catch {
          res.status(401).json({ message: "Refresh token invalid or expired" });
        }
      } else {
        res.status(401).json({ message: "Invalid token" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Authentication error" });
  }
};
