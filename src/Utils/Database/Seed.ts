import { getRepository } from "typeorm";

import User from "../../Entity/User/User";

export async function seedDatabase(): Promise<void> {
  const userRepo = getRepository(User);

  const admin = await userRepo.findOne({ username: "admin" });

  if (!admin) {
    await userRepo.save({
      fullname: "Administrator",
      username: "admin",
      roles: ["ADMIN"],
      isActive: true
    });
  }
}
