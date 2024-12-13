import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string
      refreshToken?: string
      username?: string
    } & DefaultSession["user"]
  }

  interface User {
    username?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    username?: string
    accessTokenExpires?: number
  }
} 