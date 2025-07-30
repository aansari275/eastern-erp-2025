import { db } from "./server/db";
import { users } from "./shared/schema";

async function addUser() {
  await db.insert(users).values({
    id: crypto.randomUUID(),
    fullName: "Test User",
    email: "test@example.com",
    role: "admin",
    createdAt: new Date(), // 👈 FIXED
  });

  console.log("✅ User inserted");
}

addUser().catch((err) => console.error("❌ Error inserting user:", err));
