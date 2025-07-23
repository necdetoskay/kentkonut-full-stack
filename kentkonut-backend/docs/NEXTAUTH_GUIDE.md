# NextAuth.js v5 Authentication System - Kurulum Rehberi

Bu rehber, modern Next.js uygulamalarında NextAuth.js v5 ile güvenli authentication sistemi kurulumu için kapsamlı bir kılavuzdur.

## 📋 İçindekiler

1. [Gerekli Paketler](#gerekli-paketler)
2. [Veritabanı Kurulumu](#veritabanı-kurulumu)
3. [NextAuth.js Konfigürasyonu](#nextauthjs-konfigürasyonu)
4. [Middleware Kurulumu](#middleware-kurulumu)
5. [API Route Handlers](#api-route-handlers)
6. [Client-Side Kullanım](#client-side-kullanım)
7. [TypeScript Tipleri](#typescript-tipleri)
8. [Ortam Değişkenleri](#ortam-değişkenleri)
9. [Güvenlik Ayarları](#güvenlik-ayarları)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Gerekli Paketler

### Core Dependencies

```bash
npm install next-auth@5.0.0-beta.4
npm install @auth/prisma-adapter
npm install @prisma/client prisma
npm install bcryptjs
npm install zod
```

### TypeScript Desteği

```bash
npm install -D @types/bcryptjs
npm install -D typescript
```

### package.json Dependencies

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.4",
    "@auth/prisma-adapter": "^2.9.0",
    "@prisma/client": "^5.10.2",
    "bcryptjs": "^3.0.2",
    "zod": "^3.24.3",
    "next": "^15.1.8",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "prisma": "^5.10.2",
    "typescript": "^5.2.2"
  }
}
```

---

## 🗄️ Veritabanı Kurulumu

### Prisma Schema (schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id
  name          String?
  email         String    @unique
  password      String?
  role          String    @default("user")
  emailVerified DateTime? @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @default(now()) @map("updated_at")
  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

model Account {
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        DateTime?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
  @@map("verificationtokens")
}
```

### Database Setup Commands

```bash
# Prisma generate
npx prisma generate

# Database migration
npx prisma migrate deploy

# Prisma studio (opsiyonel)
npx prisma studio
```

---

## ⚙️ NextAuth.js Konfigürasyonu

### 1. Edge-Compatible Config (auth.config.ts)

```typescript
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export default {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? "yourdomain.com" : "localhost",
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? "yourdomain.com" : "localhost",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? "yourdomain.com" : "localhost",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    // Middleware için authorized callback
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnProfile = nextUrl.pathname.startsWith('/profile');
      
      // Protected routes
      if (isOnDashboard || isOnAdmin || isOnProfile) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }
      
      return true;
    },
  },
} satisfies NextAuthConfig;
```

### 2. Main Auth Config (lib/auth.ts)

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
});
```

### 3. Database Connection (lib/db.ts)

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

---

## 🛡️ Middleware Kurulumu

### middleware.ts

```typescript
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

Bu middleware konfigürasyonu:
- ✅ **Edge Runtime** uyumlu
- ✅ **JWT** tabanlı session kontrolü
- ✅ **Authorized callback** ile route koruması
- ✅ Static dosyalar hariç tüm routes'ları kontrol eder

---

## 🔗 API Route Handlers

### app/api/auth/[...nextauth]/route.ts

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

### Protected API Routes Örneği

```typescript
// app/api/protected/route.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Admin kontrolü
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Success",
    user: session.user,
  });
}
```

---

## 💻 Client-Side Kullanım

### 1. SessionProvider Kurulumu

```typescript
// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

```typescript
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 2. Login Sayfası

```typescript
// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        // Handle error
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Sign In"}
      </button>
    </form>
  );
}
```

### 3. Protected Component

```typescript
// components/Dashboard.tsx
"use client";

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.name}!</h1>
      <p>Role: {session?.user?.role}</p>
    </div>
  );
}
```

### 4. Server Component Session

```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}!</p>
    </div>
  );
}
```

---

## 📝 TypeScript Tipleri

### types/next-auth.d.ts

```typescript
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```

---

## 🌍 Ortam Değişkenleri

### .env.local

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters"

# Auth Configuration
AUTH_TRUST_HOST="true"
```

### Production .env

```bash
# Database
DATABASE_URL="your-production-database-url"

# NextAuth.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret-key"

# Auth Configuration
AUTH_TRUST_HOST="true"
```

---

## 🔒 Güvenlik Ayarları

### 1. Password Hashing

```typescript
// utils/password.ts
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
```

### 2. User Registration

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/utils/password";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name,
        role: "user",
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 3. CSRF Protection

NextAuth.js otomatik olarak CSRF koruması sağlar. Ek güvenlik için:

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```

---

## 🛠️ Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🔍 Troubleshooting

### Common Issues

1. **NEXTAUTH_SECRET Missing**
   ```bash
   Error: Please define a `NEXTAUTH_SECRET` environment variable
   ```
   **Çözüm**: `.env.local` dosyasına minimum 32 karakter secret ekleyin.

2. **Database Connection Issues**
   ```bash
   Error: Can't reach database server
   ```
   **Çözüm**: `DATABASE_URL`'yi kontrol edin ve veritabanının çalıştığından emin olun.

3. **Middleware Loop**
   ```bash
   Error: Too many redirects
   ```
   **Çözüm**: `auth.config.ts`'deki `authorized` callback'ini kontrol edin.

4. **Session Not Found**
   **Çözüm**: Browser'da cookies'leri temizleyin ve yeniden login olun.

### Debug Mode

Development'ta debug açın:

```typescript
// auth.config.ts
export default {
  debug: process.env.NODE_ENV === "development",
  // ... other config
} satisfies NextAuthConfig;
```

---

## 🚀 Production Deployment

### 1. Environment Variables

```bash
# Vercel, Netlify veya diğer platformlarda
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
DATABASE_URL=your-production-db-url
```

### 2. Build Commands

```bash
npm run build
npm start
```

### 3. Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📊 Features Özeti

✅ **NextAuth.js v5** - En son stable sürüm  
✅ **JWT Strategy** - Edge runtime uyumlu  
✅ **Middleware Protection** - Route-level güvenlik  
✅ **TypeScript Support** - Tam tip güvenliği  
✅ **Prisma Integration** - Modern ORM  
✅ **Password Hashing** - bcryptjs ile güvenlik  
✅ **CSRF Protection** - Otomatik güvenlik  
✅ **Role-based Access** - Kullanıcı rolleri  
✅ **Production Ready** - Deployment hazır  

Bu rehber ile modern, güvenli ve ölçeklenebilir authentication sistemi kurabilirsiniz!
