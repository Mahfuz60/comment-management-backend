import bcrypt from "bcryptjs";
import { AppError } from "../utils/appError";
import { UserRepo } from "../repositories/user.repo";
import { signAccessToken } from "../utils/jwt";

export const AuthService = {
  signup: async (name: string, email: string, password: string) => {
    const hashed = await bcrypt.hash(password, 10);

    const user = await UserRepo.create({
      name,
      email,
      passwordHash: hashed,
    });

    return { user };
  },

  login: async (email: string, password: string) => {
    const user = await UserRepo.findByEmail(email);
    if (!user) throw new AppError("Invalid credentials", 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError("Invalid credentials", 401);

    const safeUser = {
      _id: String(user._id),
      email: user.email,
      name: user.name,
    };
    const token = signAccessToken(safeUser);
    return { user: safeUser, token };
  },

  me: async (userId: string) => {
    const user = await UserRepo.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return { _id: String(user._id), email: user.email, name: user.name };
  },
};
