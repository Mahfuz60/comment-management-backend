import { UserModel } from "../models/user.model";

export const UserRepo = {
  findByEmail: (email: string) => UserModel.findOne({ email }).lean(),
  findById: (id: string) => UserModel.findById(id).lean(),
  create: (data: { name: string; email: string; passwordHash: string }) =>
    UserModel.create(data),
};
