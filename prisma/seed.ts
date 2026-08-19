import "dotenv/config"
import prisma from "../lib/prisma"
import { syncModels } from "../lib/models/sync"

try {
  await syncModels()
} finally {
  await prisma.$disconnect()
}