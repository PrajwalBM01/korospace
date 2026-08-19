import "dotenv/config"
import prisma from "../lib/prisma"
import { syncModels } from "../lib/models/sync"

try {
  await syncModels({ dryRun: !process.argv.includes("--write") })
} catch (error) {
  console.error("sync failed:", error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}