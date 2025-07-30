import { db } from "./server/db";
import { users } from "./shared/schema";

async function testConnection() {
  try {
    const allUsers = await db.select().from(users);
    console.log("✅ Users fetched:", allUsers);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
  }
}

testConnection();
