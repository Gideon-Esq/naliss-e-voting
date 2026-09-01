# NALISS E-Voting

Secure departmental election platform built with Next.js, Prisma, and Neon PostgreSQL.

## Local setup

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

The local seed provides a demo eligible voter:

- Matriculation number: `NALISS/2023/001`
- Surname: `Okafor`

Change `SESSION_SECRET` and `ADMIN_PASSWORD` before deploying. Use the pooled Neon URL for `DATABASE_URL` and the direct URL for `DATABASE_URL_UNPOOLED`.

## Vercel deployment

Configure these variables in the Vercel project for Production, Preview, and Development:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `SESSION_SECRET`
- `ADMIN_PASSWORD`

Then deploy with `vercel --prod`. The install lifecycle generates Prisma Client automatically. Apply schema changes to Neon with `npx prisma db push` before deploying application code that depends on them.

## Verification

```bash
npm test
npm run lint
npm run build
```

Implemented routes include public election, candidate, announcement and nomination pages; voter identity verification; HTTP-only voting sessions; transactional ballot submission; receipts; electorate management; candidate-link review; live monitoring; and controlled result publication.
