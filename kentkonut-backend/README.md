# Kent Konut Full Stack Application

This is a full-stack web application built with Next.js.

## Authentication System

The application uses NextAuth.js for authentication with a PostgreSQL database backend. Authentication is handled through a combination of JWT tokens and database storage for user information.

### Database Authentication (PostgreSQL)

Authentication data is stored in a PostgreSQL database using the Prisma adapter for NextAuth.

Database configuration:

1. Make sure PostgreSQL is running (you can use the included Docker Compose configuration)
2. Set up your environment variables in `.env` file:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/kentkonutdb
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-token
```

### Database Setup

To set up the database:

```bash
# Start PostgreSQL using Docker
docker-compose up -d

# Run database migrations
npm run db:migrate
```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
