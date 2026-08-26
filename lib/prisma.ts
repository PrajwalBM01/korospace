import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { env } from "./env"

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}
const adapter = new PrismaNeon({
  connectionString: env.DATABASE_URL,
})
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  })
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
export default prisma
