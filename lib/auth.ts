import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "./prisma"
import { admin } from "better-auth/plugins"

import { env } from "./env"


export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },


  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-real-ip"],
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    modelName: "rateLimit",
    customRules: {
      "/sign-in/email": { window: 50, max: 5 },
      "/sign-up/email": { window: 3600, max: 3 },
      "/forget-password": { window: 3600, max: 3 },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.canvas.create({
            data: { userId: user.id, title: "untitled canvas" },
          })
        },
      },
    },
  },

  plugins: [admin(), nextCookies()],
})
