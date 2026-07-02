import bcrypt from "bcrypt";

import { userRepository } from "./repositories/user.repository";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";

export async function seedAdmin(): Promise<void> {
    const existing = await userRepository.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
        return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = userRepository.create({
        name: "Admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
    });
    await userRepository.save(admin);
    console.log(`Default admin created (${ADMIN_EMAIL})`);
}
