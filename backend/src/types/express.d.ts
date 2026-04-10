declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      role: "user" | "seller" | "admin";
    };
  }
}
